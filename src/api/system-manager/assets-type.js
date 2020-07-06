import { requestCenter } from '@/libs/request'

// 查询类别
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/anonymous/v1/assetstype/getpagelist',
    method: 'post',
    data
  })
}

// 新增类别
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/assetstype/add',
    method: 'post',
    data
  })
}

// 修改类别
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/assetstype/modify',
    method: 'put',
    data
  })
}

