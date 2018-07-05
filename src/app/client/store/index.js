import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import user from './modules/user'
Vue.use(Vuex)

const vuexLocal = new VuexPersistence({
  storage: window.localStorage,
  modules: [
    'user'
  ]
})

export default new Vuex.Store({
  modules: {
    user
  },
  plugins: [vuexLocal.plugin]
})
