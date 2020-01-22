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
    case 'fileUploadedSatusChanged':
      return {...state, status: WAIT}
    case 'chunkListInit':
      return  {...state, data: action.chunkListData}
    default:
      return initState
  }
}