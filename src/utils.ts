import { State, PIECES, BlobObj, ChunkStoreData, VerifyUploadRes } from './global'
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

function handleChunkPercentageUpdate(curState: State, idx: number, percentage: number): State {
  // 根据store不允许直接修改属性，所以返回一个新数组
  let newData: Array<ChunkStoreData> = curState.data!.map((item, index) => {
    if (index === idx) {
      return {
        fileHash: item.fileHash,
        hash: item.hash,
        index: item.index,
        size: item.size,
        percentage: percentage,
      } 
    } else {
      return {
        fileHash: item.fileHash,
        hash: item.hash,
        index: item.index,
        size: item.size,
        percentage: item.percentage,
      }
    }
  })
  return {
    ...curState,
    data: newData,
  }
}

export { handleFileChange, handleChunkPercentageUpdate, cancelReq, createFileChunk, verifyUpload }