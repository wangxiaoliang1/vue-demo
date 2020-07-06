import { requestCenter } from '@/libs/request'
/* 机种管理 接口 */

// 新增
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/model/add',
    method: 'post',
    data
  })
}

// 修改
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/model/modify',
    method: 'put',
    data
  })
}

// 查询
export const getlistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/model/getlist',
    method: 'post',
    data
  })
}

// 分页查询
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/model/getpagelist',
    method: 'post',
    data
  })
}

// 导出
export const exportReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/materialcenter/v1/model/export',
    method: 'post',
    responseType: 'arraybuffer',
    data
  })
}
// 获取机种实体
export const getentityReq = data => {
  return requestCenter({
    url: '/api/materialcenter/v1/model/getentity',
    method: 'get',
    params: data
  })
}


// // 新增规则
// export const addRuleReq = data => {
//   return requestCenter({
//     loading: true,
//     url: '/api/systemcenter/v1/coderulerelation/add',
//     method: 'post',
//     data
//   })
// }

// //获取规则集合与规则关系表
// export const getRuleListReq = data => {
//   return requestCenter({
//     loading: true,
//     url: '/api/systemcenter/v1/coderulerelation/getlist',
//     method: 'post',
//     data
//   })
// }



