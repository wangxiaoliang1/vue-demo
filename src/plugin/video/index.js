import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import "./video.youtube.css"
import videoZHCN from 'video.js/dist/lang/zh-CN.json'
import videoENUS from 'video.js/dist/lang/en.json'

export default {
  install: function (Vue, options) {
    let langObj = {}
    if (options.lang === 'zh-CN') langObj = {...videoZHCN}
    else langObj = {...videoENUS}
    videojs.addLanguage(options.lang, langObj)
    Vue.prototype.$video = videojs
  }
}