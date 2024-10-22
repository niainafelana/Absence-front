import './assets/main.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.css'
import './index.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'flowbite';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';




const app = createApp(App)

app.use(router)

app.mount('#app')
