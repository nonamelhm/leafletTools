import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'map',
    component: () => import('../views/mapView.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/testView.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
