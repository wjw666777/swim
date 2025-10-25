import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 注册 Arco Design Vue 并引入样式
import ArcoVue from '@arco-design/web-vue'
import '@arco-design/web-vue/dist/arco.css'
import { router } from './router.js'

createApp(App)
  .use(ArcoVue)
  .use(router)
  .mount('#app')
