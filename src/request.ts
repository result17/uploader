<<<<<<< HEAD
import axios, { AxiosResponse, AxiosError, CancelToken } from 'axios'

interface Headers {
  'content-type': string
}

export interface AxiosConfig {
  url: string,
  method: 'get' | 'post',
  headers?: Headers,
  data?: string | FormData,
  onUploadProgress?: (progressEvent: any) => void,
  cancelToken?: CancelToken,
}

export function request(config: AxiosConfig): Promise<AxiosResponse | void> {
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
=======
import axios, { AxiosResponse, AxiosError } from 'axios'

interface Headers {
  'content-type': string
}

export interface AxiosConfig {
  url: string,
  method: 'get' | 'post',
  headers?: Headers,
  data?: string | FormData
}

export function request(config: AxiosConfig): Promise<AxiosResponse | void> {
  return axios(config).catch(function (error: AxiosError): void {
    console.log(error.config)
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
  })
>>>>>>> 2307e19e5878126f43fb3219255ae4f4cb1be992
}