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
}

export default initState