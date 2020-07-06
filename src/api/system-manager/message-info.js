import { requestCenter } from '@/libs/request'

// 发布消息
export const pushReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/messagecenter/v1/hub/push',
    method: 'post',
    data
  })
}