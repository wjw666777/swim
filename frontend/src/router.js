import { createRouter, createWebHistory } from 'vue-router'
import SwimCRM from './views/SwimCRM.vue'
import ChongfengyiCRM from './views/ChongfengyiCRM.vue'
import FabricCRM from './views/FabricCRM.vue'
import LalianCRM from './views/lalianCRM.vue'

const routes = [
  { path: '/', redirect: '/swim' },
  { path: '/swim', name: 'swim', component: SwimCRM },
  { path: '/chongfengyi', name: 'chongfengyi', component: ChongfengyiCRM },
  { path: '/fabric', name: 'fabric', component: FabricCRM },
  { path: '/lalian', name: 'lalian', component: LalianCRM }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})