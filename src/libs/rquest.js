import axios from 'axios'
import config from '@/config'

// 请求路径
const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro

// 可以配置多个请求
export function request() {
  const instance = axios.create({
    timeout: 10 * 1000,
    baseURL: baseUrl
  })

  // 请求拦截
  instance.interceptors.request.use(config => {
    // 添加全局的loading或者验证token等的代码
    config.headers = {
      Authorization: `Bearer token`
    }
    return config
  }, error => {
    return Promise.reject(error)
  })

  // 响应拦截
  instance.interceptors.response.use(res => {
    return res
  }, error => {
    return Promise.reject(error)
  })

  return instance
}