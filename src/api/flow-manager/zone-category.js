import { requestCenter } from '@/libs/request'

// 查询类别
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/workflowcenter/v1/processtype/getpagelist',
    method: 'post',
    data
  })
}

// 新增类别
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/processtype/add',
    method: 'post',
    data
  })
}

// 修改类别
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/processtype/modify',
    method: 'put',
    data
  })
}

