import { requestCenter } from '@/libs/request'

// 获取树型数据
export const getlisttreeReq = data => {
  return requestCenter({
    url: '/api/workflowcenter/v1/process/getlisttree',
    method: 'post',
    data
  })
}

// 获取分页列表
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/workflowcenter/v1/process/getpagelist',
    method: 'post',
    data
  })
}

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/process/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/process/modify',
    method: 'put',
    data
  })
}

//获取所有制程类型信
export const getlistReq = data => {
  return requestCenter({
    url: '/api/workflowcenter/v1/processtype/getlist',
    method: 'post',
    data
  })
}


