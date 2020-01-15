import { Progress, Button } from 'antd'
import 'antd/dist/antd.css';
import * as React from 'react'
import './Uploader.css'
import { Worker } from 'worker_threads';

const PIECES: number = 10
enum Status {
  'WAIT',
  'PAUSE',
  'UPLOADING',
}

const ButtonGroup = Button.Group

async function flieUpload():Promise<void> {
  alert('uploading')
}

function resumeUpload():void {
  alert('wait')
}

function pauseUpload(): void {
  alert('')
}

interface Container {
  file: null,
  hash: string,
  worker: null | Worker,
}

interface Action {
  type: string,
  event?: React.ChangeEvent<HTMLInputElement>,
}

const initContainer: Container = {
  file: null,
  hash: '',
  worker: null,
}

function reducer(container: Container, action: Action): Container {
  switch (action.type) {
    case 'fileChange':
      return {...container}
    default:
      return initContainer
  }
}

function handleFileChange(curCainer: Container, e: React.ChangeEvent<HTMLInputElement>): Container {
  const file: FileList | null = e.target.files
  if (!file) return curCainer
  cancelReq()
}

function cancelReq():void {}

const Uploader: React.FC = ():React.ReactElement => {
  const [status, setStatus] = React.useState(Status[0])
  const [percent, setPercent] = React.useState(0)
  const [container, dispatch] = React.useReducer(reducer, initContainer)

  React.useEffect(() => {
    if (status === Status[2]) {
      flieUpload()
    } else if (status === Status[1]) {
      pauseUpload()
    } else {
      resumeUpload()
    }
  } , [status])

  return (
    <div id="uploader-wrapper">
       <Progress type="circle"
       percent={percent} 
       format={():string | undefined => {
         if (status === Status[0]) return 'start'
         else if (status === Status[1]) return '| |'
         else return '...'
       }}/>
       <ButtonGroup>
          <Button onClick={() => setStatus(Status[2])}>upload</Button>
          <Button onClick={() => setStatus(Status[0])}>reset</Button>
        </ButtonGroup>
       <input id="file-input" type="file" disabled={status === Status[0]} onChange={(e: React.ChangeEvent<HTMLInputElement>): void => dispatch({type: 'fileChange', event: e})}/>
    </div>
  )
}

export default Uploader