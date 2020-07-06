import { requestCenter } from '@/libs/request'

// 获取database数据
export const getlistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/database/getlist',
    method: 'post',
    data
  })
}

// 查询database
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/database/getpagelist',
    method: 'post',
    data
  })
}

// 新增database
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/database/add',
    method: 'post',
    data
  })
}

// 修改database
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/database/modify',
    method: 'put',
    data
  })
}

// 新增database授权
export const adddatabaseauthorizeReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/databaseauthorize/add',
    method: 'post',
    data
  })
}

// 修改database授权
export const modifydatabaseauthorizeReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/databaseauthorize/modify',
    method: 'put',
    data
  })
}
