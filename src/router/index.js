import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'map',
    component: () => import('../example/mapView.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../example/testView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
