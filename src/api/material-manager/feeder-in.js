import {requestCenter} from '@/libs/request'

// 获取Feeder信息
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/fujifeeder/getpagelist',
    method: 'post',
    data
  })
}
// 入库 - 进库房
export const setfeederinReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/fujifeeder/setfeederin',
    method: 'post',
    data
  })
}
// 出库 - 产线使用
export const setfeederoutReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/fujifeeder/setfeederout',
    method: 'post',
    data
  })
}
//  进保养 - 刚进入保养状态
export const setfeedermaintenanceinReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/fujifeeder/setfeedermaintenancein',
    method: 'post',
    data
  })
}
// 出保养 - 保养完成
export const setfeedermaintenanceoutReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/fujifeeder/setfeedermaintenanceout',
    method: 'post',
    data
  })
}

// 导出Feeder信息
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/fujifeeder/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}

// 取Feeder名称列表信息 分页查
export const getlistfeedernameReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/fujifeeder/getlistfeedername',
    method: 'post',
    data
  })
}
//获取Feeder变更记录信息 分页查询
export const getsinglefeederlogReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/fujifeeder/getsinglefeederlog',
    method: 'post',
    data
  })
}

// 导出Feeder变更记录信息
export const exportsinglefeederlogReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/fujifeeder/exportsinglefeederlog',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}

// 线别Name 数据源
export const getnamelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/fujiline/getnamelist',
    method: 'post',
    data
  })
}







