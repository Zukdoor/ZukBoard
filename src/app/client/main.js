import Vue from 'vue'
import ElementUI from 'element-ui'
import './assets/element-variables.scss'
import VueResource from 'vue-resource'

import App from './App'
import router from './router'
import store from './store'
if (process.env.NODE_ENV !== 'development') {
  // eslint-disable-next-line
  __webpack_public_path__ = window.staticBaseUrl
}
Vue.use(ElementUI)
Vue.config.productionTip = false
Vue.use(VueResource)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: { App }
})
