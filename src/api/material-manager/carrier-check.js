import { requestCenter } from '@/libs/request'

// 获取载具基本信息
export const getentityReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/carriercheck/getentity',
    method: 'post',
    data
  })
}
