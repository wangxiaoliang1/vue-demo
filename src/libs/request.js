// 请求接口封装
const querystring = require('querystring')
import axios from 'axios'
import config from '@/config'
import i18n from "../locale"
import { localRead } from "./utils"
import { Message, Spin } from 'view-design'

// 请求接口地址
export const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro

// 接口请求状态码
const _status = {
  400: i18n.t('err400'),
  401: i18n.t('err401'),
  404: i18n.t('err404'),
  999: i18n.t('err999')
}
// 错误返回值处理
const errorInfo = (loading, err) => {
  const { data, status, statusText } = err
  const info = {
    error: data.error,
    error_description: data.error_description,
    status: status,
    statusText: _status[status] || statusText
  }
  if (loading) Spin.hide()
  Message.error(`${info.status === 999 ? '' : status} ${info.statusText}`)
  return info
}

// 通用请求配置
export function requestCenter(params) {
  const instance = axios.create({
    timeout: 1000 * 20,
    baseURL: baseUrl
  })

  // axios拦截器
  instance.interceptors.request.use(config => {
    if (params.loading) Spin.show()
    // 在这里可以添加一些请求信息，比如配置header，验证令牌等
    if (params.reqType && params.reqType === 'FormData') {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
      config.transformRequest = [function (data) {
        return querystring.stringify(data)
      }]
    } else if (params.reqType && params.reqType === 'FormDataTv') {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    } else {
      config.headers['Content-Type'] = 'application/json; charset=UTF-8'
    }
    config.headers['Authorization'] = `Bearer ${localRead('token')}`
    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
    return config
  }, error => {
    // console.log('request error');
    if (params.loading) Spin.hide()
    return error
  })

  instance.interceptors.response.use(res => {
    // 响应成功
    if (params.loading) Spin.hide()
    return res.data
  }, error => {
    // 响应失败
    // console.log('response error', error);
    if (error.response) {
      return Promise.reject(errorInfo(params.loading, error.response))
    } else {
      if (params.loading) Spin.hide()
      return Promise.reject(error.request)
    }
  })

  return instance(params)
}
