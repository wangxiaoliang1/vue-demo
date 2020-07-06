import { requestCenter } from '@/libs/request'
/* 厂商供应商信息接口 */

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/customervendor/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/customervendor/modify',
    method: 'put',
    data
  })
}

// 查询
export const getlistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/customervendor/getlist',
    method: 'post',
    data
  })
}

// 分页查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/customervendor/getpagelist',
    method: 'post',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
      loading: true,
      url: '/api/systemcenter/v1/customervendor/export',
      method: 'post',
      responseType: 'arraybuffer',
      data
  })
}

