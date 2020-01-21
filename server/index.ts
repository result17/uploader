import * as express from 'express'
import Controller from './controller'

const app: express.Application = express()
const port: number = 4000

interface CorsHeader {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
}

const corsHeader: CorsHeader = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
}

const controller = new Controller()
app.use(express.json())

app.options('*', (req, res) => {
  res.set({
    ...corsHeader,
    'Status Code': 200,
  })
  res.end()
  return
})

app.post('/verify', async (req, res) => {
  await controller.handleVerifyUpload(req, res)
  return
})

app.post('/merge', async (req, res) => {
  await controller.handleMerge(req, res)
  return
})

app.post('/', async (req, res) => {
  await controller.handleMerge(req, res)
  return
})

app.listen(port, () => console.log(`sever is listening ${port}.`))
