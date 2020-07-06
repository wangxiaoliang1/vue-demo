import { requestCenter } from '@/libs/request'

// 获取用户信息
export const getcurrentuserReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/user/getcurrentuser',
    method: 'post',
    data
  })
}

// 用户退出登录
export const userofflineReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/user/useroffline',
    method: 'post',
    data
  })
}

// 查询用户
export const getpagelistReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/user/getpagelist',
    method: 'post',
    data
  })
}

// 新增角色
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/user/add',
    method: 'post',
    data
  })
}

// 修改角色
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/user/modify',
    method: 'put',
    data
  })
}

// 重置密码
export const resetpasswordReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/user/resetpassword',
    method: 'put',
    data
  })
}

// 修改密码
export const updatepasswordReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/user/updatepassword',
    method: 'put',
    data
  })
}

// 上传用户头像 (没用引用)
export const uploadheadiconReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/user/uploadheadicon',
    method: 'post',
    data
  })
}

// 上传用户头像
export const getheadiconReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/user/getheadicon',
    responseType: 'arraybuffer',
    method: 'get',
    params: {
      ...data
    }
  })
}

// 获取首页信息
export const getindexjsonReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/user/getindexjson',
    method: 'get',
    params: {
      ...data
    }
  })
}

// 设置PV
export const setpvReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/user/setpv',
    method: 'post',
    data
  })
}
