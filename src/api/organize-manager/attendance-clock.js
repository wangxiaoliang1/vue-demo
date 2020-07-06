import { requestCenter } from '@/libs/request'
/* 考勤打卡 接口 */
// 查询
export const getlistReq = data => {
  return requestCenter({
    url: '/api/usercenter/anonymous/v1/userattendance/getlist',
    method: 'post',
    data
  })
}
// 分页查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/usercenter/anonymous/v1/userattendance/getpagelist',
    method: 'post',
    data
  })
}

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/anonymous/v1/userattendance/add',
    method: 'post',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
      loading: true,
      url: '/api/usercenter/anonymous/v1/userattendance/export',
      method: 'post',
      responseType: 'arraybuffer',
      data
  })
}

