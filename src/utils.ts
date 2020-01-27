import { State, BlobObj, ChunkStoreData, VerifyUploadRes } from './global'
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
    // 比较新选择的文件跟store是否为同一文件
    if (curState.container.file.name === files[0].name && curState.container.file.lastModified === files[0].lastModified 
      && curState.container.file.size === files[0].size && curState.container.file.type === files[0].type) {
        return curState
      }
  }
  const pieces: number = calPieces(files[0].size)
  return {
    ...initState,
    container: {
      ...initState.container,
      file: files[0],
      pieces: pieces,
    }
  }
}

function calPieces(size: number): number {
  if (size > 1024 * 1024 * 1024) { 
    // 1gb chrome同一域的并发连接数为6
    return 30 
  } else if (size > 1024 * 1024 * 512 && size <= 1024 * 1024 * 1024) {
    // 512mb - 1gb
    return 24 
  } else if (size > 1024 * 1024 * 128 && size <= 1024 * 1024 * 512) {
    return 12
  } else if (size > 1024 * 1024 * 8 && size <= 1024 * 1024 * 128) {
    return 9
  } else {
    return 3
  }
}

// 文件切片
function createFileChunk(fileData: File, len: number): Array<BlobObj> {
  const fileChunkList: Array<BlobObj> = []
  const chunkSize: number = Math.ceil(fileData.size / len)
  let cur: number = 0
  while (cur < fileData.size) {
    let next: number = cur + chunkSize
    fileChunkList.push({ file: fileData.slice(cur, next) })
    cur = next
  }
  return fileChunkList
}

function createUploadListNumAry(uploadedList: Array<string>): Array<number> {
  const reg: RegExp = /.*-(.*)$/
  // 确保是升序排列
  return uploadedList.map(upload => parseInt(upload.replace(reg, '$1'))).sort((a, b) => a - b)
}

function createResumUploadChunkAry(fileData: File, uploadedNumAry: Array<number>, pieces: number): Array<BlobObj> {
  const fileChunkList: Array<BlobObj> = []
  const chunkSize: number = Math.ceil(fileData.size / pieces)
  let step: number = 0
  while (step < pieces) {
    if (!uploadedNumAry.includes(step)) {
      let start: number = step * chunkSize, end: number = start + chunkSize
      fileChunkList.push({file: fileData.slice(start, end)})
    }
    step++
  }
  return fileChunkList
}

function handleChunkPercentageUpdate(curState: State, idx: number, percentage: number): State {
  // 因为store不允许直接修改属性，所以返回一个新数组
  let newData: Array<ChunkStoreData> = curState.data!.map((item, index) => {
    return {
      ...item,
      percentage: index === idx ? percentage : item.percentage,
    } 
  })
  return {
    ...curState,
    data: newData,
  }
}

function handleResumChunkPercentageUpdate(curState: State, numAry: Array<number>): State {
  let newData: Array<ChunkStoreData> = curState.data!.map((item, index) => {
    return {
      ...item,
      percentage: numAry.includes(index) ? 100 : 0,
    }
  })
  return {
    ...curState,
    data: newData,
  }
}

function createRestNumAry(ary: Array<number>, pieces: number): Array<number> {
  let rest: Array<number> = []
  for (let i = 0; i < pieces; i++) {
    if (!ary.includes(i)) {
      rest.push(i)
    }
  }
  return rest
}

export { 
  handleFileChange, 
  handleChunkPercentageUpdate, 
  createFileChunk, 
  verifyUpload, 
  createUploadListNumAry, 
  createResumUploadChunkAry,
  handleResumChunkPercentageUpdate,
  createRestNumAry,
}
