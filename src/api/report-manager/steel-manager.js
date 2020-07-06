import { requestCenter } from '@/libs/request'

// 获取Gas信息
export const getSteelGasReq = data => {
  return requestCenter({
    url: '/api/reportcenter/anonymous/v1/gasmonitor/getlist',
    method: 'get',
    params: data
  })
}
// 获取GasMongo信息
export const getGasMongoReq = data => {
  return requestCenter({
    url: '/api/systemcenter/anonymous/v1/mongo/querymnt',
    method: 'post',
    data
  })
}

// 获取钢网信息
export const getsteelReq = data => {
  return requestCenter({
    url: '/api/reportcenter/anonymous/v1/steel/getsteel',
    method: 'post',
    data
  })
}