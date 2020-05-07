// 其他页面路由模块
const otherRouter = []

// 错误页面路由模块
const errorRouter = [
  {
    path: '/401',
    name: 'error-401',
    meta: {
      title: '401',
      hideInMenu: true
    },
    component: () => import('@/views/error-page/401.vue')
  },
  {
    path: '/500',
    name: 'error-500',
    meta: {
      title: '500',
      hideInMenu: true
    },
    component: () => import('@/views/error-page/500.vue')
  },
  {
    path: '*',
    name: 'error-404',
    meta: {
      title: '404',
      hideInMenu: true
    },
    component: () => import('@/views/error-page/404.vue')
  }
]

// 非业务路由 创建动态路由时可以用这个路由和请求接口得来的路由组合成一个完整的路由，404页面路由必须是最后一个路由
export const fixRouter = [
  ...otherRouter,
  ...errorRouter
]

// 业务路由
const mainRouter = []

export default [
  ...mainRouter,
  ...fixRouter
]
