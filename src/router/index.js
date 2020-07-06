import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'
import routers from './routers'
import i18n from '@/locale'
import { setTitle, canTurnTo, initNode, initMenuList, localReadObject, localRead } from '@/libs/utils'
import { watermarkFn, getNowToDate } from '@/libs/tools'

Vue.use(VueRouter)

const LOGIN_PAGE_NAME = 'login'

const turnTo = (to, access, next) => {
  if (canTurnTo(to.name, access, routers)) {
    store.dispatch('handlePageView')
    next() // 有权限，可访问
  } else next({ replace: true, name: 'error-401' }) // 无权限，重定向到401页面
}

// 消息提示判断
const signalrTips = (vm, data) => {
  let state = { 1: 'info', 2: 'success', 3: 'warning', 4: 'error' }
  let dialogState = state[data.dialogState]
  if (data.dialogType === 0) {
    const obj = { content: data.content, duration: data.duration, closable: true }
    vm.$Message[dialogState](obj)
  } else if (data.dialogType === 1) {
    const obj = { title: data.title, content: data.content, duration: data.duration }
    vm.$Message[dialogState](obj)
  } else if (data.dialogType === 2) vm.$router.go(0)
  else {
    vm.$Modal.confirm({
      title: data.title, content: data.content, duration: data.duration,
      onOk: () => {
        vm.$router.go(0)
      }
    })
  }
}

// 导入路由数据
const routes = [
  ...routers
]

//创建路由对象
const router = new VueRouter({
  // mode: 'history',
  routes
})

// 前置守卫
router.beforeEach((to, form, next) => {
  let vm = router.app
  vm.$Loading.start()
  // 判断是否进入检测 vm.$config.nameList 等页面
  if (vm.$config.nameList.includes(to.name)) {
    clearInterval(store.state.timer)
    next()
  }
  // 判断是否登录
  else if (!store.state.token) {
    // 未登录
    if (to.name !== LOGIN_PAGE_NAME) {
      // 要跳转的页面不是登录页面
      next({ replace: true, name: LOGIN_PAGE_NAME })
      vm.$Loading.finish()
      if (Number(localRead('locked'))) vm.$Message.warning(i18n.t('notLogin'))
    } else next()
  } else {
    // 已登录
    if (localRead('locked') === '1' && to.name !== 'locking') {
      next({ replace: true, name: 'locking' })
      vm.$Loading.finish()
      vm.$Message.warning({ content: i18n.t('unlockTipsPwd'), duration: 3 })
    } else if (to.name === LOGIN_PAGE_NAME) {
      // 要跳转的页面是登录页
      next({ replace: true, name: vm.$config.homeName }) // 跳转到homeName页
      vm.$Loading.finish()
    } else {
      // 设置全局定时器
      if (!store.state.timer) {
        store.commit('setTimer', setInterval(() => {
          // 刷新失效token
          if (Number(localRead('timer')) < getNowToDate(0)) store.dispatch('handleTimer')
          // 验证账号是否被登录
          if (!store.state.refreshingToken) {
            store.dispatch('handleIntrospect', vm)
          }
          // 验证账号是否已经登录12个小时
          if (Number(localRead('logoutTimer')) < getNowToDate(0)) {
            vm.$Message.warning({ content: i18n.t('loginTips2'), duration: 0, closable: true })
            store.dispatch('handleLogOut')
            next({ name: LOGIN_PAGE_NAME })
          }
        }, 1000 * store.state._setCheckTimeValue))
      }
      // 菜单导航是否获取
      if (store.state.hasGetMenuInfo) {
        // 启动实时通讯
        if (vm.signalr.state === 0) {
          vm.signalr.start().then(() => {
            vm.$Message.success(i18n.t('linkServerSuccess'))
          }).catch(() => {
            vm.$Message.warning(i18n.t('linkServerError'))
          })
          vm.signalr.off('public')
          vm.signalr.off(store.state.id)
          // 接受所有消息
          vm.signalr.on('public', data => signalrTips(vm, data))
          // 接受个人消息
          vm.signalr.on(store.state.id, data => signalrTips(vm, data))
        }
        // 判断是否有权限跳转该页面
        turnTo(to, store.state.access, next)
      } else if (to.name !== 'error-500') {
        store.commit('setUserInfo', localReadObject('userInfo'))
        // 获取导航菜单信息
        store.dispatch('handleGetLeftMenuList').then(res => {
          let menuList = initNode(res.result)
          store.commit('updateAppRouter', menuList)
          let list = []
          initMenuList(list, store.getters.menuList)
          let menu = list.find(x => x.name === to.name)
          if (menu) store.commit('updateMenuId', menu.id)
          store.commit('updateHasGetMenuInfo', true)
          store.commit('updatePageName', ['home'])
          next({ replace: true, name: to.name, query: to.query })
        }).catch((err) => {
          if (err.status === 0) {
            vm.$Message.warning({ content: i18n.t('errNetwork'), duration: 0, closable: true })
          } else {
            vm.$Message.warning({ content: i18n.t('loginTips3'), duration: 0, closable: true })
          }
          store.dispatch('handleLogOut')
          next({ name: LOGIN_PAGE_NAME })
        })
      } else next()
    }
  }
})

// 后置钩子
router.afterEach((to) => {
  let vm = router.app
  // 设置页面名称
  setTitle(to, vm)
  vm.$Loading.finish()
  // 添加水印
  watermarkFn(store.state.userName)
})

export default router
