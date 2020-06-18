import { Progress, Button, message } from 'antd'
import 'antd/dist/antd.css'
import * as React from 'react'
import './Uploader.css'
import { Container, BlobObj, ChunkData, WAIT, PAUSE, UPLOADING, baseURL } from './global'
import initState from './store'
import reducer from './reducer'
import pLimit from 'p-limit'
import { request, Params } from './request'
import axios, { AxiosResponse } from 'axios'
import { createFileChunk, verifyUpload, createUploadListNumAry, createResumUploadChunkAry, createRestNumAry } from './utils'

const ButtonGroup = Button.Group

const Uploader: React.FC = ():React.ReactElement => {
  const [state, dispatch] = React.useReducer(reducer, initState)
  
  function calHash(list: Array<BlobObj>): Promise<string> {
    return new Promise((resolve, reject) => {
      const worker: Worker = new Worker('/hash.js') 
      dispatch({type: 'hashWorker', worker: worker})
      worker?.postMessage({ list })
      worker.onmessage = e => {
        const { percentage, hash } = e.data
        dispatch({type: 'updateHashPercentage', percentage: percentage})
        if (hash) {
          resolve(hash)
        }
      }
    })
  }
  
  async function handleUpload(): Promise<any> {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()

    if (!state.container.file) return Promise.reject()
    const fileChunkList: Array<BlobObj> = createFileChunk(state.container.file, state.container.chunkSize)
    let hash: string = await calHash(fileChunkList)
    dispatch({type: 'updateHash', hash: hash})
    const { shouldUpload, uploadedList }= await verifyUpload(state.container.file.name, hash)
    // 服务器存在该文件
    if (!shouldUpload) {
      message.success("upload sucess!")
      dispatch({type: 'uploadReset'})
      return
    }
    // 空数组也为true
    if (uploadedList) {
      const chunkListDatainit: Array<ChunkData> = fileChunkList.map((fileChunk: BlobObj, index: number): ChunkData => {
        let chunkHash: string = `${hash}-${index}`
        return {
          fileHash: hash,
          index,
          hash: chunkHash,
          chunk: fileChunk.file,
          size: fileChunk.file.size,
          percentage: uploadedList.includes(chunkHash) ? 100 : 0,
          cancelToken: source.token,
          canceler: source.cancel,
        }
      })
      // filter chunk此数组只用于上传切片，在store保存是多余的(在react更新状态会影响速度)
      dispatch({
        type: 'chunkListInit', 
        chunkListData: chunkListDatainit.map(chunkData => {
          return {
            fileHash: chunkData.fileHash,
            index: chunkData.index,
            hash: chunkData.hash,
            size: chunkData.size,
            percentage: chunkData.percentage,
            canceler: chunkData.canceler,
          }
        })
      })
      await uploadChunks(state.container, chunkListDatainit, hash, uploadedList)
    }
  }

  // 扫描临时文件夹，对于已经上传到文件夹的切片名通过服务器的JSON中的uploadedList，此时不再对切片进行上传
async function uploadChunks(container: Container, chunkDataList: Array<ChunkData>, fileHash: string, uploadedList: Array<string> = []): Promise<void> {
  const willUploadChunkList: Array<ChunkData> = chunkDataList.filter(chunkData => !uploadedList.includes(chunkData.hash))

  const limit = pLimit(3)
  const requestFormDataPromiseList: Array<Promise<AxiosResponse | void>> = willUploadChunkList.map((uploadChunk, idx) => {
    const params: Params = {
      hash: uploadChunk.hash,
      size: uploadChunk.size,
      fileHash: uploadChunk.fileHash,
      filename: container.file!.name,
    }
    return limit(() => request({
      method: 'put',
      url: baseURL,
      data: uploadChunk.chunk,
      headers: { 'content-type': 'application/octet-stream' },
      params: params,
      onUploadProgress: createProgressHandler(uploadChunk.index),
      cancelToken: willUploadChunkList[idx].cancelToken,
    }))
  })
  console.log('task begin')
  let pList = await Promise.all(requestFormDataPromiseList)
  // 取消axios请求pList中会有undefined
  if (!pList.includes(undefined)) {
    await mergeRequest(state.container, fileHash)
  }
}

// 为每一个切片创建一个独立的事件监听函数
function createProgressHandler(index: number) {
  return function(e: ProgressEvent) {
    let chunkPercentage: number = ((e.loaded / e.total) * 100) | 0
    dispatch({
      type: 'updateChunkPercentage',
      chunkIdx: index,
      chunkPercentage: chunkPercentage,
    })
  }
}

/* 通知服务端合并切片(如果合并大文件是需要长时间，而前端客户端不应关心服务器事务，
  所以服务器应该第一时间响应，而不是等到文件合并完才进行响应)
*/
async function mergeRequest(container: Container, hash: string): Promise<void> {
  await request({
    method: 'post',
    url: `${baseURL}/merge`,
    headers: {
      'content-type': 'application/json'
    },
    data: JSON.stringify({
      fileHash: hash,
      filename: container.file!.name
    })
  })
  message.success("upload sucess!")
  setTimeout(() => dispatch({type: 'uploadReset'}), 2000)
}

async function handleResum() {
  const CancelToken = axios.CancelToken
  const source = CancelToken.source()

  const { shouldUpload, uploadedList } = await verifyUpload(state.container.file!.name, state.container.hash)
  if (!shouldUpload) {
    message.success("upload sucess!")
    dispatch({type: 'uploadReset'})
    return
  }
  // numAry为所有已经上传到服务器切片的编号数组
  const numAry: Array<number> = createUploadListNumAry(uploadedList as Array<string>)
  const restNumAry: Array<number> = createRestNumAry(numAry, state.data!.length)
  // 更新恢复上传后切片的进度，已经上传的为100%，其余为0%
  dispatch({type: 'updateResumChunkPercentage', uploadedNumAry: numAry})
  // debugger
  const resumUploadChunkAry: Array<BlobObj> = createResumUploadChunkAry(state.container.file as File, numAry, state.container.chunkSize)
  const resumUploadChunkList: Array<ChunkData> = resumUploadChunkAry.map((chunk: BlobObj, idx: number) => {
    let chunkHash: string = `${state.container.hash}-${restNumAry[idx]}`

    return {
      fileHash: state.container.hash,
      hash: chunkHash,
      index: restNumAry[idx],
      chunk: chunk.file,
      size: chunk.file.size,
      percentage: 0,
      cancelToken: source.token,
      canceler: source.cancel,
    }
  })
  await uploadChunks(state.container, resumUploadChunkList, state.container.hash)
}

React.useEffect(() => {
  if (state.status === UPLOADING && !state.data!.length) {
    // 未生成文件切片 初次上传状态
    handleUpload()
  } else if (state.status === UPLOADING && state.data!.length) {
  // 已经生成文件切片 恢复上传状态
    handleResum()
  }
}, [state.status])
  return (
    <div id="uploader-wrapper">
       <div id="hash-progress">
         检验文件进度：
         <Progress 
           type="circle"
           percent={state.hashPercentage} 
           format={():string | undefined => {
             if (state.status === WAIT) return 'start'
             else if (state.status === PAUSE) return '| |'
             else return `${Math.floor(state.hashPercentage as number)}%`
           }}
         />
       </div>
       <div id="upload-progress">
         上传文件进度：
         <Progress 
           type="circle"
           percent={
            state.data!.length ?
             (state.data!.reduce((acc, cur) => acc += cur.size * cur.percentage, 0) / state.container.file!.size) | 0 : 0
           }
         />
       </div>
       <ButtonGroup>
          <Button 
            onClick={() => {
              if (state.container.file ) {
                // 初次上传状态 wait -> uploading和恢复上传状态 pause -> uploading
                dispatch({type: 'uploadFile'})
              } 
            }}
            disabled={!state.container.file}>
          upload
          </Button>
          <Button 
            onClick={() => {
              if (state.data!.length) {
                state.data![0].canceler()
              }
              dispatch({type: 'uploadReset'})
            }}
            disabled={!state.data!.length}>
          reset
          </Button>
          <Button
            onClick={() => {
              // 取消上传文件切片（不能在计算hash中暂停）
              if (state.data!.length) {
                state.data![0].canceler()
              }
              dispatch({type: 'uploadPause'})
            }}
            disabled={!state.container.file}>
          pause
          </Button>
        </ButtonGroup>
       <input 
         id="file-in" 
         type="file" disabled={status === 'wait'} 
         onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
          event.persist()
          // 上传文件后再次选择文件时选择取消会报错，即是取消也会触发changeEvent
          // 如果非等待不允许更改文件
          if (event.target!.files?.length && state.status === WAIT) {
            dispatch({type: 'fileChange', event: event})
          } else {
            message.error('wrong, dont try it')
          }
         }}
      />
      <div id="chunk-list-progress">
        {
          state.data!.map((chunkData) => {
            return <Progress key={chunkData.hash} size="small" percent={chunkData.percentage} />
          })
        }
      </div>
    </div>
  )
}

export default Uploader