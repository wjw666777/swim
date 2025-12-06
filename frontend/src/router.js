import { createRouter, createWebHistory } from 'vue-router';
import SwimCRM from './views/SwimCRM.vue';
import ChongfengyiCRM from './views/ChongfengyiCRM.vue';
import FabricCRM from './views/FabricCRM.vue';
import LalianCRM from './views/lalianCRM.vue';
import WholesaleCRM from './views/wholesaleCRM.vue';
import ShishiClothesCRM from './views/shishiClothesCRM.vue';
import LiaoningSwimCRM from './views/liaoningSwimCRM.vue';
import ZhejiangSwimCRM from './views/zhejiangSwimCRM.vue';
import NananClothesCRM from './views/nananClothesCRM.vue';
import JinjiangClothesCRM from './views/jinjiangClothesCRM.vue';

const routes = [
    { path: '/', redirect: '/swim' },
    { path: '/swim', name: 'swim', component: SwimCRM },
    { path: '/shishi', name: 'shishi', component: ShishiClothesCRM },
    { path: '/liaoning', name: 'liaoning', component: LiaoningSwimCRM },
    { path: '/zhejiang', name: 'zhejiang', component: ZhejiangSwimCRM },
    { path: '/nanan', name: 'nanan', component: NananClothesCRM },
    { path: '/jinjiang', name: 'jinjiang', component: JinjiangClothesCRM },
    { path: '/chongfengyi', name: 'chongfengyi', component: ChongfengyiCRM },
    { path: '/fabric', name: 'fabric', component: FabricCRM },
    { path: '/lalian', name: 'lalian', component: LalianCRM },
    { path: '/wholesale', name: 'wholesale', component: WholesaleCRM },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
