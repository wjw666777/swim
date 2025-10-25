import { createRouter, createWebHistory } from 'vue-router'
import SwimCRM from './views/SwimCRM.vue'
import ChongfengyiCRM from './views/ChongfengyiCRM.vue'

const routes = [
  { path: '/', redirect: '/swim' },
  { path: '/swim', name: 'swim', component: SwimCRM },
  { path: '/chongfengyi', name: 'chongfengyi', component: ChongfengyiCRM }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})