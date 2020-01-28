import axios, { AxiosResponse, AxiosError, CancelToken } from 'axios'

interface Params {
  hash: string,
  fileHash: string,
  filename: string,
  size: number,
}

interface Headers {
  'content-type': 'application/octet-stream' | 'application/json'
}

interface AxiosConfig {
  url: string,
  method: 'get' | 'post' | 'put',
  headers: Headers,
  data: string | Blob,
  params?: Params
  onUploadProgress?: (progressEvent: any) => void,
  cancelToken?: CancelToken,
}

function request(config: AxiosConfig): Promise<AxiosResponse | void> {
  return axios(config).catch(function (error: AxiosError): void {
    if (axios.isCancel(error)) {
      // console.log('canceled')
    } else {
      if (error.response) {
        // console.log(error.response.data)
        console.log(error.response.headers)
        console.log(error.response.status)
        if (error.response.status === 404) {
          throw new Error('url is wrong')
        }
      } else if (error.request) {
        console.log(error.request)
      } else {
        console.log('Error', error.message)
      }
    }
  })
}

export { request, AxiosConfig, Params }