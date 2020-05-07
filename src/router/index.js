import Vue from 'vue'
import VueRouter from 'vue-router'
import {watermarkFn, setTitle} from '@/libs/tools'

Vue.use(VueRouter)

  const routes = []

const router = new VueRouter({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, form, next) => {
  const vm = router.app
  vm.$Loading.start()
  next()
})

// 后置钩子
router.afterEach((to) => {
  const vm = router.app
  // 设置页面名称
  setTitle(to, vm)
  vm.$Loading.finish()
  // 添加水印
  watermarkFn(vm.$store.state.userName)
})

export default router
