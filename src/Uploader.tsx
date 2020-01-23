import { Progress, Button, message } from 'antd'
import 'antd/dist/antd.css'
import * as React from 'react'
import './Uploader.css'
import { Container, BlobObj, ChunkData, WAIT, PAUSE, UPLOADING, formDataObj } from './global'
import initState from './store'
import reducer from './reducer'
import { request } from './request'
import { AxiosResponse } from 'axios'
import { createFileChunk, verifyUpload } from './utils'

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
    if (!state.container.file) return Promise.reject()
    const fileChunkList: Array<BlobObj> = createFileChunk(state.container.file)
    // hash值可以保存在local host中
    let hash: string = await calHash(fileChunkList)
    dispatch({type: 'updateHash', hash: hash})
    const { shouldUpload, uploadedList }= await verifyUpload(state.container.file.name, hash)
    // 服务器存在该文件
    if (!shouldUpload) {
      message.success("upload sucess!")
      dispatch({type: 'fileUploadedSatusChanged'})
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
          }
        })
      })
      await uploadChunks(state.container, chunkListDatainit, uploadedList, hash)
    }
  }
  
  

  // 扫描临时文件夹，对于已经上传到文件夹的切片名通过服务器的JSON中的uploadedList，此时不再对切片进行上传
async function uploadChunks(container: Container, chunkDataList: Array<ChunkData>, uploadedList: Array<string> = [], fileHash: string): Promise<void> {
  const willUploadChunkList: Array<ChunkData> = chunkDataList.filter(chunkData => !uploadedList.includes(chunkData.hash))
  const requestFormDataList: Array<formDataObj> = willUploadChunkList.map((chunkData, index) => {
    const formData = new FormData()
    formData.append('chunk', chunkData.chunk)
    formData.append('hash', chunkData.hash)
    // https://stackoverflow.com/questions/40349987/how-to-suppress-error-ts2533-object-is-possibly-null-or-undefined
    formData.append('filename', container.file!.name)
    formData.append('fileHash', fileHash)
    return {
      index,
      formData,
    }
  })
  const requestFormDataPromiseList: Array<Promise<AxiosResponse | void>> = requestFormDataList.map((formDataObj, idx) => {
    return request({
      method: 'post',
      url: 'http://localhost:4000',
      data: formDataObj.formData,
      onUploadProgress: createProgressHandler(idx),
    })
  })
  // const uploadedPromiseList: Array<Promise<void>> = uploadedList.map(uploaded => Promise.resolve())
  // 可能不需要组成一个新数组
  await Promise.all(requestFormDataPromiseList)
  await mergeRequest(state.container, fileHash)
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
    url: 'http://localhost:4000/merge',
    headers: {
      'content-type': 'application/json'
    },
    data: JSON.stringify({
      fileHash: hash,
      filename: container.file!.name
    })
  })
  message.success("upload sucess!")
  dispatch({type: 'uploadReset'})
}

React.useEffect(() => {
  if (state.status === UPLOADING) {
    handleUpload()
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
             else return `${state.hashPercentage}%`
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
           status={state.data!.length ? 'active' : 'normal'}
         />
       </div>
       <ButtonGroup>
          <Button 
            onClick={() => {
              if (state.container.file) {
                dispatch({type: 'uploadFile'})
              }
            }}
            disabled={!state.container.file}>
          upload
          </Button>
          <Button 
            onClick={() => dispatch({type: 'uploadReset'})}
            disabled={!state.container.file}>
          reset
          </Button>
        </ButtonGroup>
       <input id="fileIn" 
         type="file" disabled={status === 'wait'} 
         onChange={(event: React.ChangeEvent<HTMLInputElement>): void => {
          event.persist()
          // 上传文件后再次选择文件时选择取消会报错，即是取消也会触发changeEvent
          if (event.target!.files?.length) {
            dispatch({type: 'fileChange', event: event})
          }
         }}
      />
    </div>
  )
}

export default Uploader