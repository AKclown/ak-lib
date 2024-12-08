import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'akclown-ui';
import '@akclown-ui/theme-chalk/src/index.scss'

const app = createApp(App)
// 安装组件库
app.use(ElementPlus)
app.mount('#app')

