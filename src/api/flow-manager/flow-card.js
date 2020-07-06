import { requestCenter } from '@/libs/request'
import { baseUrl } from '@/libs/request'
/* 流程卡 接口 */
// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/unitinfotravel/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/unitinfotravel/modify',
    method: 'put',
    data
  })
}

// 查询
export const getlistReq = data => {
  return requestCenter({
    url: '/api/workflowcenter/v1/unitinfotravel/getlist',
    method: 'post',
    data
  })
}

// 分页查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/workflowcenter/v1/unitinfotravel/getpagelist',
    method: 'post',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/workflowcenter/v1/unitinfotravel/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}

// 下载防呆模板
export const downloadReq = data => {
  return requestCenter({
    url: '/api/workflowcenter/v1/unitinfotravel/download',
    method: 'get',
    responseType: 'arraybuffer',
    params: data
  })
}
//批量导入
export const uploadUrl = `${baseUrl}/api/usercenter/v1/userattlimit/upload`