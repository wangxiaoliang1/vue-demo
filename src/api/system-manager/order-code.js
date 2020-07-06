import { requestCenter } from '@/libs/request'

// 根据单据编码获取生成的编码
export const getbillnumberReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/coderule/getbillnumber',
    method: 'get',
    params: data
  })
}

// 获取单据编码
export const getlistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/coderule/getlist',
    method: 'post',
    data
  })
}

// 分页获取单据编码
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/coderule/getpagelist',
    method: 'post',
    data
  })
}

// 新增单据编码
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/coderule/add',
    method: 'post',
    data
  })
}

// 修改单据编码
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/coderule/modify',
    method: 'put',
    data
  })
}
