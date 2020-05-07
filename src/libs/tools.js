import watermark from 'watermark-dom'
import config from '@/config'

/**
 * @description 根据当前跳转的路由设置显示在浏览器标签的title
 * @param {Object} routeItem 路由对象
 * @param {Object} vm Vue实例
 */
export const setTitle = (routeItem, vm) => {
  const handledRoute = getRouteTitleHandled(routeItem)
  const pageTitle = showTitle(handledRoute, vm)
  const resTitle = pageTitle ? `${config.title} - ${pageTitle}` : config.title
  window.document.title = resTitle
}

export const showTitle = (item, vm) => {
  let { title, __titleIsFunction__ } = item.meta
  if (!title) return
  if (config.useI18n) {
    if (title.includes('{{') && title.includes('}}') && config.useI18n) title = title.replace(/({{[\s\S]+?}})/, (m, str) => str.replace(/{{([\s\S]*)}}/, (m, _) => vm.$t(_.trim())))
    else if (__titleIsFunction__) title = item.meta.title
    else title = vm.$t(item.name)
  } else title = (item.meta && item.meta.title) || item.name
  return title
}

export const getRouteTitleHandled = (route) => {
  let router = { ...route }
  let meta = { ...route.meta }
  let title = ''
  if (meta.title) {
    if (typeof meta.title === 'function') {
      meta.__titleIsFunction__ = true
      title = meta.title(router)
    } else title = meta.title
  }
  meta.title = title
  router.meta = meta
  return router
}

/**
 * 设置localStorage缓存
 * @param key
 * @param value 转换成string类型的值存储
 */
export const localSave = (key, value) => {
  if (typeof (value) === 'object') {
    localStorage.setItem(key, JSON.stringify(value))
  } else {
    localStorage.setItem(key, value)
  }
}

/**
 * 读取localStorage缓存
 * @param key
 * @returns {string}
 */
export const localRead = key => {
  return localStorage.getItem(key) || ''
}

/**
 * 读取复杂类型的localStorage缓存
 * @param key
 * @returns {any}
 */
export const localReadObj = key => {
  return JSON.parse(localStorage.getItem(key) || '{}')
}

/**
 * @returns {String} 当前浏览器名称
 */
export const getExplorer = () => {
  const ua = window.navigator.userAgent
  const isExplorer = (exp) => {
    return ua.indexOf(exp) > -1
  }
  if (isExplorer('MSIE')) return 'IE'
  else if (isExplorer('Firefox')) return 'Firefox'
  else if (isExplorer('Chrome')) return 'Chrome'
  else if (isExplorer('Opera')) return 'Opera'
  else if (isExplorer('Safari')) return 'Safari'
}

/**
 * @description 字符串左边不足补0
 * @param {*} str 字符串
 */
export const padLeftZero = str => {
  return ('00' + str).substr(str.length)
}

/**
 * @description 日期格式化
 * @param {Date,String} date 日期
 * @param {*} fmt 格式化样式 yyyy-MM-dd hh:mm:ss
 */
export const formatDate = (dateStr, fmt) => {
  if (dateStr === undefined) return ''
  let date = new Date(dateStr)
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    let str = o[k] + ''
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

/**
 * 初始化前n天到今天的日期取值
 * @param n 往前去的天数 number类型
 * @returns {(string|*)[]}
 */
export const initPageDate = (n = 0) => {
  let dateObj = new Date()
  let startTime = dateObj.getTime() - (n * 24 * 3600 * 1000)
  let endTime = dateObj.getTime() + (0 * 24 * 3600 * 1000)
  return [formatDate(new Date(startTime), 'yyyy-MM-dd hh:mm:ss'), formatDate(new Date(endTime), 'yyyy-MM-dd hh:mm:ss')]
}

/**
 * 接口错误返回判断
 * @param vm vue实例 this
 * @param errorCode 错误码
 * @return {string} 错误信息
 */
export const errorType = (vm, errorCode) => {
  let errorValue = ''
  switch (errorCode) {
    case 10001:
      errorValue = vm.$t('err10001')
      break
    case 10002:
      errorValue = vm.$t('err10002')
      break
  }
  return errorValue
}

/**
 * 发出提示音
 * @param url 提示音的音频文件地址
 */
export const playSound = url => {
  let newAudio = new Audio(url)
  newAudio.src = url
  newAudio.play().then(() => {})
}

/**
 * Input组件内容全选
 * @param refsName
 */
export const inputSelectContent = refsName => {
  refsName.$el.children[1].select()
}

/**
 * 添加水印
 * @param name 水印名称
 */
export const watermarkFn = (name = '') => {
  watermark.load({
    watermark_txt: name, // 水印的内容
    watermark_x: 140, // 水印起始位置x轴坐标
    watermark_y: 80, // 水印起始位置Y轴坐标
    watermark_rows: 5, // 水印行数
    watermark_cols: 5, // 水印列数
    watermark_x_space: 190, // 水印x轴间隔
    watermark_y_space: 75, // 水印y轴间隔
    watermark_font: '华文彩云', // 水印字体
    watermark_color: 'black', // 水印字体颜色
    watermark_fontsize: '26px', // 水印字体大小
    watermark_alpha: 0.1, // 水印透明度，要求设置在大于等于0.005
    watermark_width: 100, // 水印宽度
    watermark_height: 100, // 水印长度
    watermark_angle: 40 // 水印倾斜度数
  })
}
