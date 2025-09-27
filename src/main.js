import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Create and mount the Vue application
const app = createApp(App)

// Global error handler
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue Error:', err, info)
}

// Global properties (if needed)
app.config.globalProperties.$appName = 'BiteHeist'
app.config.globalProperties.$version = '1.0.0'

// Mount the app
app.mount('#app')