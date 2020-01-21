import { Progress, Button, message } from 'antd'
import 'antd/dist/antd.css'
import * as React from 'react'
import './Uploader.css'
import { Container, BlobObj, ChunkData, WAIT, PAUSE, UPLOADING, formDataObj } from './global'
import initState from './store'
import reducer from './reducer'
import { request } from './request'
import { AxiosResponse } from 'axios'
import { handleFileChange, cancelReq, createFileChunk, verifyUpload } from './utils'

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
  

  // async function handleUpload(): Promise<any> {
  //   if (!state.container.file) return Promise.reject()
  //   const fileChunkList: Array<BlobObj> = createFileChunk(state.container.file)
  //   // hash值可以保存在local host中
  //   let hash: string = await calHash(fileChunkList)
  //   const { shouldUpload, uploadedList }= await verifyUpload(state.container.file.name, state.container.hash)
  //   if (!shouldUpload) {
  //     message.success("upload sucess!")
  //     dispatch({type: 'fileUploadedSatusChanged'})
  //     return
  //   }
  //   if (uploadedList) {
  //     const chunkListDatainit: Array<ChunkData> = fileChunkList.map((fileChunk: BlobObj, index: number): ChunkData => {
  //       return {
  //         fileHash: state.container.hash,
  //         index,
  //         hash: state.container.hash + '-' + index,
  //         chunk: fileChunk.file,
  //         size: fileChunk.file.size,
  //         percentage: uploadedList.includes(index) ? 100 : 0
  //       }
  //     })
  //     dispatch({type: 'chunkListInit', chunkListData: chunkListDatainit})
  //   }
  // }
  
  

  // 扫描临时文件夹，对于已经上传到文件夹的切片名通过服务器的JSON中的uploadedList，此时不再对切片进行上传
async function uploadChunks(container: Container,chunkDataList: Array<ChunkData>, uploadedList: Array<string> = []): Promise<void> {
  const willUploadChunkList: Array<ChunkData> = chunkDataList.filter(chunkData => !uploadedList.includes(chunkData.hash))
  const requestFormDataList: Array<formDataObj> = willUploadChunkList.map((chunkData, index) => {
    const formData = new FormData()
    formData.append('chunk', chunkData.chunk)
    formData.append('hash', chunkData.hash)
    // https://stackoverflow.com/questions/40349987/how-to-suppress-error-ts2533-object-is-possibly-null-or-undefined
    formData.append('filename', container.file!.name)
    formData.append("fileHash", container.hash)
    return {
      index,
      formData,
    }
  })
  const requestFormDataPromiseList: Array<Promise<AxiosResponse | void>> = requestFormDataList.map(formDataObj => {
    return request({
      method: 'post',
      url: 'http://localhost:3000',
      data: formDataObj.formData,
    })
  })
  const uploadedPromiseList: Array<Promise<void>> = uploadedList.map(uploaded => Promise.resolve())
  await Promise.all([uploadedPromiseList, requestFormDataPromiseList])
}

// 通知服务端合并切片
async function mergeRequest(container: Container) {
  await request({
    method: 'post',
    url: 'http://localhost:3000/merge',
    headers: {
      'content-type': 'application/json'
    },
    data: JSON.stringify({
      fileHash: container.hash,
      filename: container.file!.name
    })
  })
  message.success("upload sucess!")
  dispatch({type: 'uploadReset'})
}

async function handleUpload(): Promise<any> { 

}

React.useEffect(() => {
  if (state.status === UPLOADING) {
    
  }
}, [state.status])
  return (
    <div id="uploader-wrapper">
       <Progress type="circle"
       percent={state.hashPercentage} 
       format={():string | undefined => {
         if (state.status === WAIT) return 'start'
         else if (state.status === PAUSE) return '| |'
         else return '...'
       }}/>
       <ButtonGroup>
          <Button 
          onClick={() => {
            if (state.container.file) {
              dispatch({type: 'uploadFile'})
            }
          }}
          disabled={!state.container.file}>
          upload</Button>
          <Button 
          onClick={() => dispatch({type: 'uploadReset'})}
          disabled={!state.container.file}
          >reset</Button>
        </ButtonGroup>
       <input id="fileIn" 
         type="file" disabled={status === 'wait'} 
         onChange={(e: React.ChangeEvent<HTMLInputElement>): void => dispatch({type: 'fileChange', event: e})}
      />
    </div>
  )
}

export default Uploader