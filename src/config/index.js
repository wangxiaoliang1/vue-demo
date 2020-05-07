export default {
  /**
   * @description 配置显示在浏览器标签的title
   */
  title: '后台管理系统',
  /**
   * @description 是否使用国际化，默认为false
   *              如果不使用，则需要在路由中给需要在菜单中展示的路由设置meta: {title: 'xxx'}
   *              用来在菜单中显示文字
   */
  useI18n: true,
  /**
   * @description 默认打开的首页的路由name值，默认为home
   */
  homeName: 'home',
  /**
   * @description 接口默认请求地址
   */
  baseUrl: {
    dev: 'http://10.32.42.30:8000',
    pro: 'http://10.32.42.30:8000'
  },
  /**
   * @description 分页每页条数切换的配置
   */
  pageSizeList: [5, 20, 50, 100, 500, 1000],
  /**
   * @description 分页默认显示数
   */
  pageSizeDefault: 20,
  /**
   * @description 分页配置
   */
  pageConfig: {
    pageSize: 20, // 每页显示数
    pageNum: 1, // 当前页
    sidx: 'CREATEDATE', // 排序字段
    sord: true, // 排序类型true升序 false降序
    total: 0, //  总条数
    totalPage: 0 //  总页数
  },
  /**
   * @description 需要加载的插件
   */
  plugin: {
    'error-store': {
      showInHeader: false, // 设为false后不会在顶部显示错误日志徽标
      developmentOff: false // 设为true后在开发环境不会收集错误信息，方便开发中排查错误
    }
  },
  systemFlag: ['baize']
}