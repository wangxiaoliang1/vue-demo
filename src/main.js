import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from '@/locale'
import config from '@/config'
import ViewUI from 'view-design'
import './index.less'

Vue.use(ViewUI, {
  size: 'small',
  i18n: (key, value) => i18n.t(key, value)
})
Vue.config.productionTip = false
Vue.prototype.$config = config

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount('#app')
