import { requestCenter } from '@/libs/request'

// 分页获取报表信息
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/workorderissuereport/getpagelist',
    method: 'post',
    data
  })
}

// 导出工单报表
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissuereport/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}