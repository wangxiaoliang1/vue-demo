import { requestCenter } from '@/libs/request'

// 获取指定目录下的所有文件信息
export const filesReq = data => {
  return requestCenter({
    url: '/api/systemcenter/anonymous/v1/assets/files',
    method: 'get',
    params: data
  })
}

// 获取Video资源
export const videoReq = data => {
  return requestCenter({
    url: '/api/systemcenter/anonymous/v1/assets/video',
    method: 'get',
    params: data
  })
}

// 获取静态资源
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/anonymous/v1/assets/getpagelist',
    method: 'post',
    data
  })
}

// 新增类别
export const addReq = data => {
  return requestCenter({
    reqType: 'FormDataTv',
    url: '/api/systemcenter/v1/assets/add',
    method: 'post',
    data
  })
}

// 修改类别
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    reqType: 'FormDataTv',
    url: '/api/systemcenter/v1/assets/modify',
    method: 'put',
    data
  })
}
