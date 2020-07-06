import { requestCenter } from '@/libs/request'

// 获取信息 设备心跳检测管理
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/anonymous/v1/devicehealth/getpagelist',
    method: 'post',
    data
  })
}