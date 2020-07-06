import { requestCenter } from '@/libs/request'
/* 信息替代料 接口 */

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/ebomavl/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/ebomavl/modify',
    method: 'put',
    data
  })
}

// 查询
export const getlistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/ebomavl/getlist',
    method: 'post',
    data
  })
}

// 分页查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/ebomavl/getpagelist',
    method: 'post',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/ebomavl/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}




