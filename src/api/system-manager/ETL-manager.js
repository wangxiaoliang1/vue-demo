import { requestCenter } from '@/libs/request'

// 分页获取JOB
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/etl/getpagelist',
    method: 'post',
    data
  })
}

// 新增JOB
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/etl/add',
    method: 'post',
    data
  })
}

// 修改JOB
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/etl/modify',
    method: 'put',
    data
  })
}

// 高级修改JOB
export const modifyadvancedReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/etl/modifyadvanced',
    method: 'put',
    data
  })
}

// 获取Log信息
export const getlogReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/etl/getlog',
    method: 'post',
    data
  })
}
