import { createApp } from 'vue'
import App from './App.vue'

//import ElementPlus components
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
//import vue router
import routers from "./routers";
//import ant-design-vue
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
//import pinia
import { createPinia } from 'pinia'
const pinia = createPinia()


const app = createApp(App)
app.use(ElementPlus)
app.use(routers)
app.use(Antd)
app.use(pinia)
app.mount('#app')