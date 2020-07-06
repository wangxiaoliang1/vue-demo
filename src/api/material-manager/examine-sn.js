import { requestCenter } from '@/libs/request'

// 分页获取SN检查信息
export const getpagelistReq = data => {
    return requestCenter({
        url: '/api/materialcenter/v1/checksn/getpagelist',
        method: 'post',
        data
    })
}
// 下载SN防呆模板
export const downloadReq = data => {
    return requestCenter({
        url: '/api/materialcenter/v1/checksn/download',
        method: 'get',
        responseType: 'arraybuffer',
        params: data
    })
}

// 校验SN信息
export const getsnReq = data => {
    return requestCenter({
        loading: true,
        url: '/api/materialcenter/v1/checksn/getsn',
        method: 'get',
        params: data
    })
}

// 获取SN检查日志记录
export const getlistReq = data => {
    return requestCenter({
        loading: true,
        url: '/api/materialcenter/v1/checksn/getlist',
        method: 'post',
        data
    })
}

// 导出SN检查信息
export const exportReq = data => {
    return requestCenter({
        loading: true,
        url: '/api/materialcenter/v1/checksn/export',
        method: 'post',
        responseType: 'arraybuffer',
        data
    })
}
// 修改SN检查
export const modifyReq = data => {
    return requestCenter({
      loading: true,
      url: '/api/materialcenter/v1/checksn/modify',
      method: 'put',
      data
    })
  }
