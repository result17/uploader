interface BlobObj {
  file: Blob
}

interface Container {
  file: File | null,
  hash: string,
  worker: Worker | undefined,
}

interface Action {
  type: string,
  event?: React.ChangeEvent<HTMLInputElement>,
  worker?: Worker,
  percentage?: number | undefined,
  chunkListData?: Array<ChunkData>,
}

interface State {
  container: Container,
  hashPercentage: number | undefined,
  data: Array<ChunkData> | undefined,
  requestList: Array<string>,
  status: string,
  // 当暂停时会取消 xhr 导致进度条后退
  // 为了避免这种情况，需要定义一个假的进度条
  fakeUploadPercentage: number,
}

interface VerifyUploadRes {
  shouldUpload: Boolean,
  uploadedList?: Array<any>,
}

interface ChunkData {
  chunk: Blob,
  fileHash: string,
  hash: string,
  index: number,
  percentage: number,
  size: number,
}

interface formDataObj {
  formData: FormData,
  index: number,
}

declare const PIECES: 10

declare const WAIT: 'wait'
declare const PAUSE: 'pause'
declare const UPLOADING: 'uploading'



export { BlobObj, Container, Action, State, VerifyUploadRes, ChunkData , PIECES, WAIT, PAUSE, UPLOADING, formDataObj }