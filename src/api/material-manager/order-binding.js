import { requestCenter } from '@/libs/request'

// 获取工单绑定分页数据
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/workorderissuebinding/getpagelist',
    method: 'post',
    data
  })
}

// 工单绑定新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissuebinding/add',
    method: 'post',
    data
  })
}

// 删除工单绑定
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissuebinding/modify',
    method: 'put',
    data
  })
}

// 获取工单绑定中RID的信息,当RID数量大于50提示是否继续。
export const getworidqtyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissuebinding/getworidqty',
    method: 'post',
    data
  })
}

// RID清零
export const zeroReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissuebinding/zero',
    method: 'put',
    data
  })
}

// 导出工单绑定信息
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/workorderissuebinding/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}