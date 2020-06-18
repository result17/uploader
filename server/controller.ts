import * as path from 'path'
import * as fse from 'fs-extra'
import * as express from 'express'

const targetDir: string = 'target'
const UPLOAD_DIR: string = path.resolve(__dirname, '..', targetDir)

function extractExt(filename: string): string {
  const reg: RegExp = /.*\.(.*)$/
  // 如果不存在后缀名则等于file，如foo.
  const ext: string = filename.replace(reg, '$1') || 'file'
  return ext
}

// 合并切片
async function mergeFileChunk(filePath: string, fileHash: string): Promise<void> {
  // 临时保存切片的文件夹
  const chunkDir: string = `${UPLOAD_DIR}/${fileHash}`
  // readdir以promise形式返回文件夹中所有文件组成文件名数组
  let chunkPathAry: Array<string> = await fse.readdir(chunkDir)
  // 确保切片顺序
  chunkPathAry.sort()
  // 创建文件
  console.log(filePath)
  await fse.writeFile(filePath, '')
  chunkPathAry.forEach(chunk => {
    fse.appendFileSync(filePath, fse.readFileSync(`${chunkDir}/${chunk}`))
    fse.unlinkSync(`${chunkDir}/${chunk}`)
  })
  fse.rmdirSync(chunkDir)
}


async function createdUploadedList(fileHash: string): Promise<Array<string | void>> {
  return fse.existsSync(`${UPLOAD_DIR}/${fileHash}`) ? await fse.readdir(`${UPLOAD_DIR}/${fileHash}`) : []
}

interface VerifyUploadReq {
  filename: string,
  fileHash: string,
}

interface MergeReq {
  filename: string,
  fileHash: string,
}

export default class Controller  {
  async handleVerifyUpload(req: express.Request, res: express.Response): Promise<void> {
    const data: VerifyUploadReq = req.body
    const ext: string = extractExt(data.filename)
    const filePath = `${UPLOAD_DIR}/${data.fileHash}.${ext}`
    // 检查文件是否上传并完成合并
    if (fse.existsSync(filePath)) {
      res.end(
        JSON.stringify({
          shouldUpload: false
        })
      )
    } else {
      res.end(
        JSON.stringify({
          shouldUpload: true,
          uploadedList: await createdUploadedList(data.fileHash)
        })
      )
    }
  }
  // 处理上传的切片将其保存到临时文件夹
  async handleUpload(req: express.Request, res: express.Response): Promise<void> {
    const hash: string = req.query.hash
    const fileHash: string = req.query.fileHash
    const filename: string = req.query.filename
    const chunkDir: string = `${UPLOAD_DIR}/${fileHash}`
    const filePath = `${UPLOAD_DIR}/${filename}`
    const chunkPath = `${chunkDir}/${hash}`
    // 文件存在直接返回
    if (fse.existsSync(filePath)) {
      res.end('file exist')
      return
    }
    // 切片目录不存在，创建切片目录
    if (!fse.existsSync(chunkDir)) {
      await fse.mkdirs(chunkDir)
    }

    await fse.outputFile(chunkPath, req.body)
    .then(() => res.end('received file chunk'))
    .catch(err => {
      console.error(err)
      res.status(500).end('process file chunk failed')
      return
    })
  }
  async handleMerge(req: express.Request, res: express.Response): Promise<void> {
    res.end(
      JSON.stringify({
        code: 0,
        message: 'chunks begin merging.'
      })
    )
    const data: MergeReq = req.body
    const ext: string = extractExt(data.filename)
    const filePath = `${UPLOAD_DIR}/${data.fileHash}.${ext}`
    await mergeFileChunk(filePath, data.fileHash)
  }
}
