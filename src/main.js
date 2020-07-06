import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ViewUI from 'view-design'
import i18n from '@/locale'
import config from '@/config'
import importDirective from '@/directive'
import importPlugins from '@/plugin'
import '@/index.less'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import '@/assets/iconfont/iconfont.css'

// 注册组件
Vue.use(ViewUI, {
  size: 'small',
  i18n: (key, value) => i18n.t(key, value)
})
importPlugins(Vue)

/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = true

/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config

/**
 * 注册指令
 */
importDirective(Vue)

// 创建vue对象
new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
