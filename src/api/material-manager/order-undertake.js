import { requestCenter } from '@/libs/request'

// 分页获取工单承接信息
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/workorderissueundertake/getpagelist',
    method: 'post',
    data
  })
}

// 工单承接
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissueundertake/modify',
    method: 'put',
    data
  })
}

// 工单结算
export const setReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissueundertake/set',
    method: 'put',
    data
  })
}

// 获取工单基本信息
export const getentityReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/gwobase/getentity',
    method: 'post',
    data
  })
}

// 导出承接信息
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissueundertake/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}