import { requestCenter } from '@/libs/request'

// 获取树型数据
export const getlisttreeReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/eqp/getlisttree',
    method: 'post',
    data
  })
}

// 获取分页列表
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/eqp/getpagelist',
    method: 'post',
    data
  })
}

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/eqp/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/eqp/modify',
    method: 'put',
    data
  })
}




