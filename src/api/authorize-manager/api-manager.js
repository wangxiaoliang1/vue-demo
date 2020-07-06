import { requestCenter } from '@/libs/request'

// 获取api数据
export const getlistReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/api/getlist',
    method: 'get',
    params: data
  })
}

// 查询api
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/api/getpagelist',
    method: 'post',
    data
  })
}

// 新增api
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/api/add',
    method: 'post',
    data
  })
}

// 修改api
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/api/modify',
    method: 'put',
    data
  })
}

// 新增api授权
export const addapiauthorizeReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/apiauthorize/add',
    method: 'post',
    data
  })
}

// 修改api授权
export const modifyapiauthorizeReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/apiauthorize/modify',
    method: 'put',
    data
  })
}
