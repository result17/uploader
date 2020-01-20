import { State, PIECES, BlobObj, ChunkData, formDataObj, Container, VerifyUploadRes } from './global'
import { request, AxiosConfig } from './request'
import { AxiosResponse } from 'axios'

function flieUpload():void {
  alert('uploading')
}

function resumeUpload():void {
  alert('wait')
}

function pauseUpload(): void {
  alert('pause')
}

async function verifyUpload(filename: string, fileHash: string): Promise<VerifyUploadRes> {
  let requestConfig: AxiosConfig = {
    method: 'post',
    url: 'http://localhost:3000/verify',
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
  return JSON.parse(res.data)
}

function handleFileChange(curState: State, e: React.ChangeEvent<HTMLInputElement>): State {
  const files: FileList | null = e.target.files
  if (!files) return curState
  cancelReq()
  return {...curState, container: {
    file: files[0],
    hash: '',
    worker: undefined,
  }}
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


export { handleFileChange, cancelReq, createFileChunk, verifyUpload, flieUpload, resumeUpload, pauseUpload }