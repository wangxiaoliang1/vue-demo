import { requestCenter } from '@/libs/request'
/* Rule信息接口 */

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/rule/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/rule/modify',
    method: 'put',
    data
  })
}

// 查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/rule/getpagelist',
    method: 'post',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/rule/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}

