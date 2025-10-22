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

// Global error handler to prevent app crashes
app.config.errorHandler = (err, instance, info) => {
  // eslint-disable-next-line no-console
  console.error('Global Vue error:', err, info)
}

// Catch unhandled Promise rejections
window.addEventListener('unhandledrejection', (event) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled promise rejection:', event.reason)
})
app.mount('#app')
