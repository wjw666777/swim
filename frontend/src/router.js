import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', redirect: '/swim' },
    { path: '/swim', name: 'swim', component: () => import('./views/SwimCRM.vue') },
    { path: '/shishi', name: 'shishi', component: () => import('./views/shishiClothesCRM.vue') },
    { path: '/liaoning', name: 'liaoning', component: () => import('./views/liaoningSwimCRM.vue') },
    { path: '/zhejiang', name: 'zhejiang', component: () => import('./views/zhejiangSwimCRM.vue') },
    { path: '/nanan', name: 'nanan', component: () => import('./views/nananClothesCRM.vue') },
    { path: '/huian', name: 'huian', component: () => import('./views/huianClothesCRM.vue') },
    { path: '/xiaofu', name: 'xiaofu', component: () => import('./views/xiaofuClothesCRM.vue') },
    { path: '/licheng', name: 'licheng', component: () => import('./views/lichengClothesCRM.vue') },
    { path: '/yonghe', name: 'yonghe', component: () => import('./views/yongheClothesCRM.vue') },
    { path: '/yinglin', name: 'yinglin', component: () => import('./views/yinglinClothesCRM.vue') },
    { path: '/quanzhou_mens', name: 'quanzhou_mens', component: () => import('./views/quanzhouMensCRM.vue') },
    { path: '/shuangqi', name: 'shuangqi', component: () => import('./views/shuangqiVendorsCRM.vue') },
    { path: '/jinjiang', name: 'jinjiang', component: () => import('./views/jinjiangClothesCRM.vue') },
    { path: '/shishi_market', name: 'shishi_market', component: () => import('./views/shishiMarketVendorsCRM.vue') },
    { path: '/jindong_market', name: 'jindong_market', component: () => import('./views/jindongMarketVendorsCRM.vue') },
    {
        path: '/shisanhang_market',
        name: 'shisanhang_market',
        component: () => import('./views/shisanhangMarketVendorsCRM.vue'),
    },
    {
        path: '/dongguan_printing',
        name: 'dongguan_printing',
        component: () => import('./views/dongguanPrintingCRM.vue'),
    },
    { path: '/chongfengyi', name: 'chongfengyi', component: () => import('./views/ChongfengyiCRM.vue') },
    { path: '/fabric', name: 'fabric', component: () => import('./views/FabricCRM.vue') },
    { path: '/lalian', name: 'lalian', component: () => import('./views/lalianCRM.vue') },
    { path: '/wholesale', name: 'wholesale', component: () => import('./views/wholesaleCRM.vue') },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
