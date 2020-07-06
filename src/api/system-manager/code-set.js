import { requestCenter } from '@/libs/request'
/* 编码集合接口 */
// 查询
export const getlistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/coderulecollection/getlist',
    method: 'post',
    data
  })
}
// 分页查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/systemcenter/v1/coderulecollection/getpagelist',
    method: 'post',
    data
  })
}

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/coderulecollection/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/coderulecollection/modify',
    method: 'put',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/coderulecollection/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}

// 新增规则
export const addRuleReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/coderulerelation/add',
    method: 'post',
    data
  })
}

//获取规则集合与规则关系表
export const getRuleListReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/systemcenter/v1/coderulerelation/getlist',
    method: 'post',
    data
  })
}



