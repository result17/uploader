import { State, WAIT } from './global'

const initState: State = {
  container: {
    file: null,
    hash: '',
    worker: undefined,
  },
  hashPercentage: 0,
  data: [],
  status: WAIT,
  requestList: [],
  fakeUploadPercentage: 0,
}
export default initState