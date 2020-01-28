import * as express from 'express'
import Controller from './controller'
import * as bodyParser from 'body-parser'

const app: express.Application = express()
const port: number = 4000

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

const controller = new Controller()
app.use(express.json())
app.use(bodyParser.raw({type: 'application/octet-stream', limit: '1mb'}))
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
  await controller.handleUpload(req, res)
  return
})

app.listen(port, () => console.log(`server is listening ${port}.`))
