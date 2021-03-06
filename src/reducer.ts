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
      return initState
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
}