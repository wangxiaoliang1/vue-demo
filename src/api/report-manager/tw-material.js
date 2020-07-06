import { requestCenter } from '@/libs/request'

// 获取设备类型
export const getEquipmentTypeReq = data => {
  return requestCenter({
    url: '/api/reportcenter/anonymous/v1/twmaterialreport/getlocaltionlist',
    method: 'get',
   params: data
  })
}

// 获取机台信息
export const getMachineInfoReq = data => {
  return requestCenter({
    url: '/api/reportcenter/anonymous/v1/twmaterialreport/geteqpnamelist',
    method: 'get',
    params: data
  })
}
// 获取报表信息 参数:来自于geteqpnamelist的返回值
export const getReportlistReq = data => {
  return requestCenter({
    url: '/api/reportcenter/anonymous/v1/twmaterialreport/getreportlist',
    method: 'get',
    params: data
  })
}
