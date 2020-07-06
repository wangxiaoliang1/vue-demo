import { requestCenter } from '@/libs/request'

// 获取数据字典树数据
export const getlisttreeReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/detaitem/getlisttree',
    method: 'post',
    data
  })
}

// 获取数据字典分页列表数据
export const getpagelisttreeReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/detaitem/getpagelisttree',
    method: 'post',
    data
  })
}

// 数据字典新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/detaitem/add',
    method: 'post',
    data
  })
}

// 数据字典修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/detaitem/modify',
    method: 'put',
    data
  })
}

// 获取数据字典明细数据
export const getlistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/dataitemdetail/getlist',
    method: 'post',
    data
  })
}

// 数据字典明细新增
export const adddetailReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/dataitemdetail/add',
    method: 'post',
    data
  })
}

// 数据字典明细修改
export const modifydetailReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/dataitemdetail/modify',
    method: 'put',
    data
  })
}
