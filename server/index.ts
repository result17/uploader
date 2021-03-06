import * as express from 'express'
import Controller from './controller'
import * as bodyParser from 'body-parser'
import * as path from 'path'
import { exec } from 'child_process'

const nginxPath = path.resolve('..', 'nginx')
exec('nginx -c conf/h2.conf', { cwd: nginxPath })

const app: express.Application = express()
const port: number = 5000

interface CorsHeader {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST' | 'GET, POST, PUT'
}

const corsHeader: CorsHeader = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT',
}

let uploadStart: number = 0

app.use(express.json())
// 文件切片大小最大值为50mb
app.use(bodyParser.raw({type: 'application/octet-stream', limit: '50mb'}))

const controller = new Controller()

app.options('*', (req, res) => {
  res.set({
    ...corsHeader,
  })
  res.status(200).end()
  return
})

app.post('/verify', async (req, res) => {
  res.set({
    ...corsHeader,
  })
  await controller.handleVerifyUpload(req, res)
  return
})

app.post('/merge', async (req, res) => {
  if (uploadStart) {
    console.log(`Totally spend ${Math.floor((Date.now() - uploadStart) / 1000)} seconds`)
    uploadStart = 0
  }
  res.set({
    ...corsHeader,
  })
  await controller.handleMerge(req, res)
  return
})

app.put('/', async (req, res) => {
  res.set({
    ...corsHeader,
  })
  if (!uploadStart) uploadStart = Date.now()
  await controller.handleUpload(req, res)
  return
})

app.listen(port, () => console.log(`server is listening ${port}.`))
