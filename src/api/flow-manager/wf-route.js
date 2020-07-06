import { requestCenter } from '@/libs/request'

// 获取列表
export const getlistReq = data => {
  return requestCenter({
    url: '/api/workflowcenter/v1/wfroute/getlist',
    method: 'post',
    data
  })
}

// 分页查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/workflowcenter/v1/wfroute/getpagelist',
    method: 'post',
    data
  })
}

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/wfroute/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/wfroute/modify',
    method: 'put',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/wfroute/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}

