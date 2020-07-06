import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css'
import video from './video'
import signalr from './singnalr'

const importPlugins = Vue => {
  Vue.use(signalr) // 注册通讯文件
  // 注册图片查看插件
  Vue.use(Viewer)
  Viewer.setDefaults({
    defaultOptions: {
      zIndex: 9999
    }
  })
  // 注册video播放器插件
  Vue.use(video, {lang: 'zh-CN'})
}

export default importPlugins