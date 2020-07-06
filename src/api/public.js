import { requestCenter } from '@/libs/request'
export const getdatabaselistReq = async data => {
    let res = await requestCenter({
        url: '/api/systemcenter/v1/database/getlist',
        method: 'post',
        data
    })
    if (res.code === 200 && res.result) {
        return res.result || []
    } else {
        return []
    }
}
