import { CancelToken } from 'axios'

interface BlobObj {
  file: Blob
}

interface Container {
  file: File | null,
  hash: string,
  worker: Worker | undefined,
  chunkSize: number,
}

interface Action {
  type: string,
  event?: React.ChangeEvent<HTMLInputElement>,
  worker?: Worker,
  percentage?: number | undefined,
  chunkListData?: Array<ChunkStoreData>,
  hash?: string,
  chunkIdx?: number,
  chunkPercentage?: number,
  uploadedNumAry?: Array<number>,
}

interface State {
  container: Container,
  hashPercentage: number | undefined,
  data: Array<ChunkStoreData> | undefined,
  requestList: Array<string>,
  status: string,
}

interface VerifyUploadRes {
  shouldUpload: Boolean,
  uploadedList?: Array<any>,
}

interface ChunkStoreData {
  fileHash: string,
  hash: string,
  index: number,
  percentage: number,
  size: number,
  canceler: () => void,
}
interface ChunkData extends ChunkStoreData {
  chunk: Blob,
  cancelToken: CancelToken,
}

interface formDataObj {
  formData: FormData,
  index: number,
}

const WAIT = 'wait'
const PAUSE = 'pause'
const UPLOADING = 'uploading'

export { BlobObj, Container, Action, State, VerifyUploadRes, ChunkData, ChunkStoreData, WAIT, PAUSE, UPLOADING, formDataObj }
