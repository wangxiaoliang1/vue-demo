// 非业务路由 创建动态路由时可以用这个路由和请求接口得来的路由组合成一个完整的路由，404页面路由必须是最后一个路由
export const fixRouter = []

// 业务路由
const mainRouter = []

export default [
    ...mainRouter,
    ...fixRouter
]
