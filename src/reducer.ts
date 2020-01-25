<<<<<<< HEAD
import { State, Action, WAIT, UPLOADING, PAUSE } from './global'
import initState from './store'
import { handleFileChange, handleChunkPercentageUpdate, handleResumChunkPercentageUpdate } from './utils'

export default function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'fileChange':
      return handleFileChange(state, action.event as React.ChangeEvent<HTMLInputElement>)
    case 'uploadFile':
      return {...state, status: UPLOADING}
    case 'uploadReset':
      return {...state, status: WAIT}
    case 'uploadPause':
      return {...state, status: PAUSE}
    case 'hashWorker':
      return {...state, container: {
        ...state.container,
        worker: action.worker
      }}
    case 'updateHash':
      return {...state, container: {
        ...state.container,
        hash: action.hash as string
      }}
    case 'updateHashPercentage':
      return {...state, hashPercentage: action.percentage}
    case 'chunkListInit':
      return  {...state, data: action.chunkListData}
    case 'updateChunkPercentage':
      return handleChunkPercentageUpdate(state, action.chunkIdx as number, action.chunkPercentage as number)
    case 'updateResumChunkPercentage':
      return handleResumChunkPercentageUpdate(state, action.uploadedNumAry as Array<number>)
    default:
      return initState
  }
=======
import { State, Action, WAIT, UPLOADING, Container } from './global'
import initState from './store'
import { handleFileChange } from './utils'

export default function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'fileChange':
      return handleFileChange(state, action.event as React.ChangeEvent<HTMLInputElement>)
    case 'uploadFile':
      return {...state, status: UPLOADING}
    case 'uploadReset':
      return {...state, status: WAIT}
    case 'hashWorker':
      let tempContainer: Container = {...state.container}
      tempContainer.worker = action.worker
      return {...state, container: tempContainer}
    case 'updateHashPercentage':
      return {...state, hashPercentage: action.percentage}
    case 'fileUploadedSatusChanged':
      return {...state, status: WAIT}
    case 'chunkListInit':
      return  {...state, data: action.chunkListData}
    default:
      return initState
  }
>>>>>>> 2307e19e5878126f43fb3219255ae4f4cb1be992
}