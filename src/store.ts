<<<<<<< HEAD
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

=======
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
>>>>>>> 2307e19e5878126f43fb3219255ae4f4cb1be992
export default initState