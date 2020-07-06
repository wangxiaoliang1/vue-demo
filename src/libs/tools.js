// 通用工具类方法
import watermark from 'watermark-dom'
import { hasChild } from "./utils"

export const forEach = (arr, fn) => {
  if (!arr.length || !fn) return
  let i = -1
  let len = arr.length
  while (++i < len) {
    let item = arr[i]
    fn(item, i, arr)
  }
}

/**
 * @param {Array} target 目标数组
 * @param {Array} arr 需要查询的数组
 * @description 判断要查询的数组是否至少有一个元素包含在目标数组中
 */
export const hasOneOf = (targetarr, arr) => {
  return targetarr.some(_ => arr.indexOf(_) > -1)
}

/**
 * @param {*} obj1 对象
 * @param {*} obj2 对象
 * @description 判断两个对象是否相等，这两个对象的值只能是数字或字符串
 */
export const objEqual = (obj1, obj2) => {
  const keysArr1 = Object.keys(obj1)
  const keysArr2 = Object.keys(obj2)
  if (keysArr1.length !== keysArr2.length) return false
  else if (keysArr1.length === 0 && keysArr2.length === 0) return true
  /* eslint-disable-next-line */
  else return !keysArr1.some(key => obj1[key] != obj2[key])
}

/**
 * @description 绑定事件 on(element, event, handler)
 */
export const on = (function () {
  if (document.addEventListener) {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.addEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event && handler) {
        element.attachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * @description 解绑事件 off(element, event, handler)
 */
export const off = (function () {
  if (document.removeEventListener) {
    return function (element, event, handler) {
      if (element && event) {
        element.removeEventListener(event, handler, false)
      }
    }
  } else {
    return function (element, event, handler) {
      if (element && event) {
        element.detachEvent('on' + event, handler)
      }
    }
  }
})()

/**
 * @param {Array} arr1
 * @param {Array} arr2
 * @description 得到两个数组的并集, 两个数组的元素为数值或字符串
 */
export const getUnion = (arr1, arr2) => {
  return Array.from(new Set([...arr1, ...arr2]))
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
export const initDate = (n = 0) => {
  let dateObj = new Date()
  let startTime = dateObj.getTime() - (n * 24 * 3600 * 1000)
  let endTime = dateObj.getTime()
  return [formatDate(new Date(startTime), 'yyyy-MM-dd hh:mm:ss'), formatDate(new Date(endTime), 'yyyy-MM-dd hh:mm:ss')]
}

/**
 * 获取从现在开始之后多少秒的时间戳
 * @param num 秒
 * @return {number} 时间戳
 */
export const getNowToDate = (num = 0) => {
  return new Date().getTime() + num * 1000
}


/**
 * @description 字符串左边不足补0
 * @param {String} str 字符串
 */
export const padLeftZero = str => {
  return ('00' + str).substr(str.length)
}

/**
 * @description 获取按钮是否显示
 * @param {Array} data 数组
 * @param {Object} 接受一组对象
 */
export const getButtonBoolean = (that, btnArr) => {
  that.$store.dispatch('handleGetPageButtonList', that.$config).then(res => {
    let data = res.result.data ? res.result.data : []
    data.forEach(item => {
      btnArr.push(item)
    })
  }).catch(err => {
    that.$Message.error(`${err.status} ${err.statusText}`)
  })
}

/**
 * 添加水印
 * @param name 水印名称
 */
export const watermarkFn = (name = '') => {
  watermark.load({
    watermark_txt: name ? name : '精益生产', // 水印的内容
    watermark_x: 140, // 水印起始位置x轴坐标
    watermark_y: 80, // 水印起始位置Y轴坐标
    watermark_rows: 5, // 水印行数
    watermark_cols: 5, // 水印列数
    watermark_x_space: 190, // 水印x轴间隔
    watermark_y_space: 75, // 水印y轴间隔
    watermark_font: '华文彩云', // 水印字体
    watermark_color: 'black', // 水印字体颜色
    watermark_fontsize: '25px', // 水印字体大小
    watermark_alpha: 0.1, // 水印透明度，要求设置在大于等于0.005
    watermark_width: 100, // 水印宽度
    watermark_height: 100, // 水印长度
    watermark_angle: 40 // 水印倾斜度数
  })
}

/**
 * 限制字符串最大长度
 * @param str 被检测的字符串超出
 * @param num 默认最大长度36
 * @return {boolean} 返回的判断 true
 */
export const stringLengthExceed = (str = '', num = 36) => {
  return str.length <= num
}

/**
 * 楼层线体级别判断
 * @param vm vue实例 this
 * @param category 判断的级别
 * @return {string} 级别信息
 */
export const floorLineType = (vm, category) => {
  let categoryName = ''
  switch (category) {
    case 1:
      categoryName = vm.$t('zone')
      break
    case 2:
      categoryName = vm.$t('area')
      break
    case 3:
      categoryName = vm.$t('floor')
      break
    case 4:
      categoryName = vm.$t('line')
      break
  }
  return categoryName
}

/**
 * 区段类型
 * @param vm vue实例 this
 * @param category 判断的级别
 * @return {string} 级别信息
 */
export const categoryType = (vm, category) => {
  let categoryName = ''
  switch (category) {
    case 0:
      categoryName = vm.$t('zone')
      break
    case 1:
      categoryName = vm.$t('process')
      break
  }
  return categoryName
}

/**
 * 获取楼层线体图标判断
 * @param category 判断的级别
 * @return {string} 图标信息
 */
export const getZoneIcon = (category) => {
  let val = ''
  switch (category) {
    case 1:
      val = 'iconfont icon-company'
      break
    case 2:
      val = 'iconfont icon-area'
      break
    case 3:
      val = 'iconfont icon-buffer'
      break
    case 4:
      val = 'iconfont icon-menu'
      break
  }
  return val
}

/**
 * 接口错误返回判断
 * @param vm vue实例 this
 * @param errorCode 错误码
 * @return {string} 错误信息
 */
export const errorType = (vm, errorCode = '') => {
  let errorValue = ''
  if (errorCode && errorCode > 0) {
    if (errorCode.toString().includes('.')) {
      errorValue = vm.$t('err' + String(errorCode).replace('.', '_'))
    } else {
      errorValue = vm.$t('err' + errorCode)
    }
  }
  return errorValue
}

/**
 * 获取树组件有效数据
 * @param list 获取的最新数据
 * @param arr 已授权的数据
 * @param data 全部数据
 */
export const getTreeEffectiveData = (list, arr, data) => {
  for (let item of data) {
    if (hasChild(item)) {
      let itemArr = arr.find(o => item.id === o.parentId)
      if (itemArr && itemArr.children.length === item.children.length) {
        if (hasChild(item)) getTreeEffectiveData(list, arr, item.children)
        else list.push(itemArr)
      } else getTreeEffectiveData(list, arr, item.children)
    } else {
      const listItem = arr.find(x => x.id === item.id)
      if (listItem) list.push(listItem)
    }
  }
}

/**
 * 将树型数据转为列表数据
 * @param list 获取的最新数据
 * @param data 全部数据
 */
export const initTreeList = (list, data) => {
  for (let item of data) {
    if (hasChild(item)) initTreeList(list, item.children)
    list.push(item)
  }
}

/**
 * 发出提示音
 * @param url 提示音的音频文件地址
 */
export const playSound = url => {
  let newAudio = new Audio(url)
  newAudio.src = url
  newAudio.play().then(() => {
  })
}

/**
 * Input组件内容全选
 * @param refsName
 */
export const inputSelectContent = refsName => {
  refsName.$el.children[1].select()
}

/**
 * 清除表单组件已有的值
 * @param item Object
 * @returns {null}
 */
export const clearFormValue = item => {
  let val = null
  switch (item.type) {
    case 'input':
      val = ''
      break
    case 'number':
      val = 0
      break
    case 'radio':
      val = item.children[0].name
      break
    case 'check':
      val = []
      break
    case 'select':
      val = item.multiple ? [] : ''
      break
  }
  return val
}

/**
 * 兼容edge浏览器下载文件
 * @param blob 二进制文件流
 * @param fileName 下载好的文件名
 */
export const exportFile = (blob, fileName) => {
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, fileName)
  } else {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob) // 创建URL
    link.download = fileName
    document.body.appendChild(link)
    link.style.display = 'none'
    link.click() // 下载文件
    URL.revokeObjectURL(link.href) // 释放内存
    document.body.removeChild(link)
  }
}

/**
 * 返回一个span标签
 * @param h
 * @param type
 * @returns {*}
 */
export const renderSpan = (that, h, type) => {
  return h('span', {
    style: {
      color: '#fff',
      backgroundColor: type === 1 ? '#ff9900' : '#ccc',
      padding: '1px 10px',
      margin: '3px 0',
      borderRadius: '3px',
      cursor: 'default'
    }
  }, type === 1 ? that.$t('yes') : that.$t('no'))
}

/**
 * html5 FormData分片上传大文件
 * @param {Array} files    :文件对象数组
 * @param {Object} options :配置对象
 */
export const h5FormData = function (files, options) {
  //获取FormData对象
  let getFormData = function (i, size, shardSize, shardCount, file, name) {
    //计算每一片的起始与结束位置
    let start = i * shardSize,
      end = Math.min(size, start + shardSize);
    //构造一个表单，FormData是HTML5新增的
    let form = new FormData();
    form.append('fileData', file.slice(start, end)); //slice方法用于切出文件的一部分
    form.append('name', options.videoName); //文件名
    form.append('assetsType', "video"); //文件类型
    form.append('directory', "static"); //文件类型
    form.append('fileTotal', shardCount); //总片数
    form.append('fileIndex', i + 1); //当前是第几片
    form.append('fileName', `${options.fileName}_${name}`); //文件唯一名称
    form.append('typeId', options.typeId); //文件类型
    form.append('remark', options.remark); //描述
    // 最后一条要穿的字段
    if (shardCount === i + 1) {
      form.append('playSize', '100'); //音频时长
      form.append('coverImage', options.imageFiles[0]); //封面图
    }
    return form;
  };
  //循环文件列表
  for (let i = 0; i < files.length; i++) {
    let file = files[i], //文件对象
      name = file.name, //文件名
      size = file.size, //总大小
      succeed = 0, //上传成功数量
      shardSize = 2 * 1024 * 1024, //以2MB为一个分片
      shardCount = Math.ceil(size / shardSize); //总片数
    //ajax提交后台
    if (typeof options.callback == 'function') options.callback(file, name, size, succeed, shardSize, shardCount, getFormData);
  }
}

/**
 * 前端生成 uuid
 * @param len 生成uuid的长度
 * @param radix 生成uuid的基数
 * @returns {string}
 */
export const uuid = (len, radix) => {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [], i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    // rfc4122, version 4 form
    let r = 0;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}

//获取音频时长
export const getVideoDuration = function (file, callback) {
  let url = URL.createObjectURL(file);
  let audioElement = new Audio(url);
  audioElement.addEventListener("loadedmetadata", function () {
    let duration = audioElement.duration;
    callback && callback(duration);
  });
}


/**
 * 语音播报
 * text – 要合成的文字内容，字符串
 * lang – 使用的语言，字符串， 例如：“zh-cn”
 * voiceURI – 指定希望使用的声音和服务，字符串
 * volume – 声音的音量，区间范围是0到1，默认是1
 * rate – 语速，数值，默认值是1，范围是0.1到10，表示语速的倍数，例如2表示正常语速的两倍。
 * pitch – 表示说话的音高，数值，范围从0（最小）到2（最大）。默认值为1
 * closeSpeakTime – 表示关闭语音播报的时间，值为毫秒数，为0时不关闭。默认值为0
 */
export const speak = ({ text = '', pitch = 2, lang = 'zh-CN', rate = 1, volume = 1, closeSpeakTime = 0 }) => {
  const msg = Object.assign(new SpeechSynthesisUtterance(), { text, lang, volume, rate, pitch });
  speechSynthesis.speak(msg);
  // 关闭语音
  if (closeSpeakTime) {
    setTimeout(() => {
      speechSynthesis.cancel(msg)
    }, closeSpeakTime)
  }
}
//重置 operationType 字符串
export const formatOperationType = (type) => {
  let operationTypeString = {
    0: "[出库]正常可用",
    1001: "进库房",
    1002: "进保养",
    1003: "出保养",
    1004: "出库",
  }
  return operationTypeString[type] || "";
}


//重置 厂商客户管理类型 字符串
export const customerVendorType = (type) => {
  let customerVendorTypeString = {
    0: "供应商",
    1: "厂商",
    2: "客户",
  }
  return customerVendorTypeString[type] || "";
}

// 判断是否为手机号
export const isTel = (rule, value, callback) => {
  var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
  if (value && !reg.test(value)) {
    callback(new Error('请输入正确的电话号码'));
  } else {
    callback();
  }
}

//重置设备管理类型字符串
export const eqpCategory = (type) => {
  let eqpCategoryString = {
    0: "区域",
    1: "大类",
    2: "设备",
  }
  return eqpCategoryString[type] || "";
}
//重置单据编码类型字符串
export const ordertCodeCategory = (type) => {
  let string = {
    0: "生产序号规则",
    1: "出货序号规则",
    2: "箱号规则",
    3: "栈板规则",
    4: "连扳序号规则",
  }
  return string[type] || "";
}
//重置班别字符串
export const shiftFormat = (type) => {
  let string = {
    'D': "白班",
    'N': "夜班",
  }
  return string[type] || "";
}

// 判断位号和用量是否一致
export const isLocationAndQtyOk = (rule, value, callback, vm) => {

  let qty = vm.submitData.qty || 0
  let location = vm.submitData.location || ''
  let isSubmit = location.split(',').length === qty
  if (isSubmit) {
    callback();
  } else {
    callback(new Error(vm.$t('ebomAvlLocation')));
  }
}

export const renderDate = (h, params) => {
  let date = params.row[params.column.key]
  return h("div", date ? formatDate(date, "yyyy-MM-dd hh:mm:ss") : null);
}



