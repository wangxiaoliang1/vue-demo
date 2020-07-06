import {getTokenReq, introspectReq} from '@/api/login'
import {getcurrentuserReq, setpvReq} from '@/api/organize-manager/user-manager'
import {getlisttreecurrentuserReq, getpagelisttreeReq} from '@/api/authorize-manager/menu-manager'
import {encryptDes, sha1_to_base64} from '@/libs/des'
import {localSave, localReadObject, localRemove} from "@/libs/utils"
import {getNowToDate} from "@/libs/tools"
import i18n from '@/locale'

export default {
  // 登录
  handleLogin({commit}, {userName, password}) {
    const obj = {
      client_id: 'baize',
      client_secret: 'secret',
      grant_type: 'password',
      username: userName.trim(),
      password: sha1_to_base64(encryptDes(password.trim(), 'baize#66', 'lxeP@ssx')),
      scope: 'api offline_access'
    }
    localSave('userName', obj.username)
    return new Promise((resolve, reject) => {
      getTokenReq(obj).then(res => {
        commit('setToken', res)
        localSave('token', res.access_token)
        localSave('refreshToken', res.refresh_token)
        localSave('locking', password.trim())
        getcurrentuserReq().then(resp => {
          commit('setUserInfo', resp.result)
          localSave('userInfo', resp.result)
          resolve()
        }).catch(error => {
          reject(error)
        })
      }).catch(err => {
        reject(err)
      })
    })
  },
  // 获取左侧导航菜单信息
  handleGetLeftMenuList() {
    return getlisttreecurrentuserReq()
  },
  // 获取页面授权下的按钮
  handleGetPageButtonList({state}, {pageConfig}) {
    const obj = {
      orderField: pageConfig.orderField, // 排序字段
      ascending: pageConfig.ascending, // 是否升序
      pageSize: pageConfig.pageSize, // 分页大小
      pageIndex: pageConfig.pageIndex, // 当前页码
      data: {
        id: '',
        parentId: state.menuId,
        category: 2,
        name: '',
        title: '',
        enabled: 1
      }
    }
    return getpagelisttreeReq(obj)
  },
  // 退出登录
  handleLogOut({state, commit}) {
    return new Promise((resolve) => {
      commit('setToken', {})
      commit('setUserInfo', {})
      commit('setLocking', '')
      localRemove('token')
      localRemove('refreshToken')
      localRemove('userInfo')
      localRemove('tagNavList')
      localSave('timer', 0)
      localSave('logoutTimer', 0)
      clearInterval(state.timer) // 清除全局定时器
      resolve()
    })
  },
  // 刷新token
  handleTimer({state, commit, dispatch}) {
    commit('setRefreshingToken', true)
    getTokenReq({
      grant_type: 'refresh_token',
      client_id: state.systemFlag,
      client_secret: 'secret',
      refresh_token: state.refreshToken
    }).then(resp => {
      commit('setToken', resp)
      const userInfoObj = localReadObject('userInfo')
      userInfoObj.token = state.token
      userInfoObj.refreshToken = state.refreshToken
      localSave('userInfo', userInfoObj)
      localSave('token', state.token)
      localSave('refreshToken', state.refreshToken)
      localSave('timer', getNowToDate(state._setTimeValue))
      commit('setRefreshingToken', false)
    }).catch(() => {
      dispatch('handleLogin', {userName: state.userName, password: localSave('locking')})
    })
  },
  // 验证账号是否已经登录
  handleIntrospect({state, dispatch}, vm) {
    introspectReq({
      client_id: state.systemFlag,
      client_secret: 'secret',
      token: state.token
    }).then(res => {
      if (!res.active) {
        vm.$Message.warning({content: i18n.t('loginTips'), duration: 0, closable: true})
        dispatch('handleLogOut')
        vm.$router.push({name: 'login'}).then(() => {})
      }
    }).catch(() => {
      vm.$Message.warning({content: i18n.t('errNetwork'), duration: 0, closable: true})
      dispatch('handleLogOut')
      vm.$router.push({name: 'login'}).then(() => {})
    })
  },
  // 记录页面访问次数
  handlePageView() {
    setpvReq().then(() => {})
  }
}