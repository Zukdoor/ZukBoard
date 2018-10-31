import Router from 'vue-router'
import Vue from 'vue'

const loadPage = (filename) => {
  console.log(`../pages/${filename}`)
  return require(`../pages/${filename}.vue`).default
}
Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
    path: '/app/canvas',
    name: 'canvas',
    redirect: '/app/canvas/draw',
    component: loadPage('canvas/index'),
    children: [
      {
        path: 'draw/:id?',
        name: 'room',
        component: loadPage('canvas/draw/index')
      }
    ]
  }]
})
