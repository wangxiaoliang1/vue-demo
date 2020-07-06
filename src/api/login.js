import { requestCenter } from '@/libs/request'

// 获取token
export const getTokenReq = data => {
  return requestCenter({
    reqType: 'FormData',
    url: '/connect/token',
    method: 'post',
    data
  })
}

// 查看是否有其他人登录同一个账号
export const introspectReq = data => {
  return requestCenter({
    reqType: 'FormData',
    url: '/connect/introspect',
    method: 'post',
    data
  })
}
