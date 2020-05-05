// 公共方法

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
