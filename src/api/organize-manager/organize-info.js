import { requestCenter } from '@/libs/request'

// 获取当前登录系统下的公司部门
export const getlisttreeReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/organzie/getlisttree',
    method: 'post',
    data
  })
}

// 获取指定部门和系统标识下的子公司及部门
export const getlimitlisttreeReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/organzie/getlisttree',
    method: 'get',
    params: data
  })
}

// 获取公司,部门
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/organzie/getpagelist',
    method: 'post',
    data
  })
}

// 新增公司,部门
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/organzie/add',
    method: 'post',
    data
  })
}

// 修改公司,部门
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/organzie/modify',
    method: 'put',
    data
  })
}
