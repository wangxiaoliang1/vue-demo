import { requestCenter } from '@/libs/request'

// 获取工单导入分页数据
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/workorderissuebom/getpagelist',
    method: 'post',
    data
  })
}

// 根据工单料号获取明细信息
export const getlistdetailbywopnReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissuebinding/getlistdetailbywopn',
    method: 'post',
    data
  })
}

// 工单导入新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissuebom/add',
    method: 'post',
    data
  })
}

// 导出工单导入信息
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissuebom/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}