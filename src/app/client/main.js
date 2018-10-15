import Vue from 'vue'
import 'babel-polyfill'
import ElementUI from 'element-ui'
import './assets/element-variables.scss'
import VueResource from 'vue-resource'
import '../client/assets/icon.css'
import VueAnalytics from 'vue-analytics'

import App from './App'
import router from './router'
import store from './store'

const id = process.env.GA_ID

if (process.env.NODE_ENV !== 'development') {
  // eslint-disable-next-line
  __webpack_public_path__ = window.staticBaseUrl
}
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.use(VueResource)

// If GA_ID exists, then enable Google Analytics
if (id !== undefined) {
  Vue.use(VueAnalytics, {
    id: id,
    autoTracking: {
      screenview: true
    },
    router
  })
}
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})
