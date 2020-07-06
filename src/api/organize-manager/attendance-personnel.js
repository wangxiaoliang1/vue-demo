import { requestCenter } from '@/libs/request'
/* 考勤人员维护 接口 */
// 查询
export const getlistReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/carduser/getlist',
    method: 'post',
    data
  })
}
// 分页查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/carduser/getpagelist',
    method: 'post',
    data
  })
}

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/carduser/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/carduser/modify',
    method: 'put',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
      loading: true,
      url: '/api/usercenter/v1/carduser/export',
      method: 'post',
      responseType: 'arraybuffer',
      data
  })
}

// 下载SN防呆模板
export const downloadReq = data => {
  return requestCenter({
      url: '/api/usercenter/v1/carduser/download',
      method: 'get',
      responseType: 'arraybuffer',
      params: data
  })
}
