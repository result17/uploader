import { State, PIECES, BlobObj, ChunkData, formDataObj, Container, VerifyUploadRes } from './global'
import { request, AxiosConfig } from './request'
import { AxiosResponse } from 'axios'
import initState from './store'

async function verifyUpload(filename: string, fileHash: string): Promise<VerifyUploadRes> {
  let requestConfig: AxiosConfig = {
    method: 'post',
    url: 'http://localhost:4000/verify',
    headers: {
      "content-type": "application/json"
    },
    data: JSON.stringify({
      filename,
      fileHash
    })
  }
  const res: AxiosResponse | void  = await request(requestConfig)
  if (!res) throw new Error('server has error')
  return res.data
}

// 如果是相同文件则直接返回当前状态，如果是不同文件则再次初始化状态
function handleFileChange(curState: State, e: React.ChangeEvent<HTMLInputElement>): State {
  const files: FileList | null = e.target.files
  if (!files) return curState
  if (curState.container.file) {
    if (curState.container.file.name === files[0].name && curState.container.file.lastModified === files[0].lastModified 
      && curState.container.file.size === files[0].size && curState.container.file.type === files[0].type) {
        return curState
      }
  }
  cancelReq()
  return {
    ...initState,
    container: {
      ...initState.container,
      file: files[0]
    }
  }
}
// 取消正在进行的请求
function cancelReq(): void {}

// 文件切片
function createFileChunk(fileData: File, len: number = PIECES): Array<BlobObj> {
  const fileChunkList: Array<BlobObj> = []
  const chunkSize: number = Math.ceil(fileData.size / len)
  let cur: number = 0
  while (cur < fileData.size) {
    fileChunkList.push({ file: fileData.slice(cur + chunkSize) })
    cur += chunkSize
  }
  return fileChunkList
}

function creatProgressHandler(chunkData: ChunkData) {
  return function(e: any) {
    // 此closure作用仅为更改chunkData的值
    chunkData.percentage = parseInt(String((e.loaded / e.total) * 100))
  }
}


export { handleFileChange, cancelReq, createFileChunk, verifyUpload }