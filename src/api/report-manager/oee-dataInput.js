import { requestCenter } from '@/libs/request'

// 获取报表信息 参数:来自于geteqpnamelist的返回值
export const getoeeReq = data => {
  return requestCenter({
    url: '/api/reportcenter/anonymous/v1/oee/getoee',
    method: 'post',
    loading: true,
    data
  })
}

// 根据线别获取OEE数据信息
export const getOeeLineReq = data => {
  return requestCenter({
    url: '/api/reportcenter/anonymous/v1/oee/getoeebyline',
    method: 'post',
    loading: true,
    data
  })
}

// 根据线别获取OEE数据信息
export const getOeeStationReq = data => {
  return requestCenter({
    url: '/api/reportcenter/anonymous/v1/oee/getoeebystation',
    method: 'post',
    loading: true,
    data
  })
}

// 获取查询条件 Line,Stati
export const getQueryInforReq = data => {
  return requestCenter({
    url: '/api/reportcenter/anonymous/v1/oee/getqueryinfor',
    method: 'post',
    data
  })
}



