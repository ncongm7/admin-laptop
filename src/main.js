// Polyfill cho global (cần cho sockjs-client)
if (typeof global === 'undefined') {
  window.global = window
}

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router.js'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'
import { createPinia } from 'pinia'
const pinia = createPinia()
const app = createApp(App)
app.use(router)
app.use(pinia)
app.mount('#app')
