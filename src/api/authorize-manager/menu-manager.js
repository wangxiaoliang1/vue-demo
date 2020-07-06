import { requestCenter } from '@/libs/request'

// 获取导航菜单
export const getlisttreecurrentuserReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/menubutton/getlisttreecurrentuser',
    method: 'post',
    data
  })
}

// 获取左侧菜单
export const getlisttreeauthReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/menubutton/getlisttreeauth',
    method: 'post',
    data
  })
}

// 获取分页菜单、按钮
export const getpagelisttreeReq = data => {
  return requestCenter({
    url: '/api/usercenter/v1/menubutton/getpagelisttree',
    method: 'post',
    data
  })
}

// 新增菜单、按钮
export const addReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/menubutton/add',
    method: 'post',
    data
  })
}

// 修改菜单、按钮
export const modifyReq = data => {
  return requestCenter({
    loading: true,
    url: '/api/usercenter/v1/menubutton/modify',
    method: 'put',
    data
  })
}
