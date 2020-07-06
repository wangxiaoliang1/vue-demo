import { requestCenter } from '@/libs/request'

// 获取工单信息表数据
export const getlistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/workorder/getlist',
    method: 'post',
    data
  })
}

// 获取工单信息表分页数据
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/workorder/getpagelist',
    method: 'post',
    data
  })
}

// 工单信息表新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorder/add',
    method: 'post',
    data
  })
}

// 工单信息表修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorder/modify',
    method: 'put',
    data
  })
}

// 工单信息表导出
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorder/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}