import { requestCenter } from '@/libs/request'

// 获取角色树型数据
export const getlisttreeReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/role/getlisttree',
    method: 'post',
    data
  })
}

// 查询角色
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/role/getpagelist',
    method: 'post',
    data
  })
}

// 新增角色
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/role/add',
    method: 'post',
    data
  })
}

// 修改角色
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/role/modify',
    method: 'put',
    data
  })
}

// 新增角色授权
export const addroleauthorizeReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/roleauthorize/add',
    method: 'post',
    data
  })
}

// 修改角色授权
export const modifyroleauthorizeReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/roleauthorize/modify',
    method: 'put',
    data
  })
}
