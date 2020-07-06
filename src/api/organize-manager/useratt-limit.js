import { requestCenter } from '@/libs/request'
/* 考勤排班 接口 */
// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/userattlimit/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/userattlimit/modify',
    method: 'put',
    data
  })
}

// 查询
export const getlistReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/userattlimit/getlist',
    method: 'post',
    data
  })
}

// 分页查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/userattlimit/getpagelist',
    method: 'post',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/userattlimit/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}

// 下载防呆模板
export const downloadReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/userattlimit/download',
    method: 'get',
    responseType: 'arraybuffer',
    params: data
  })
}
