import { createApp } from 'vue'
import { createPinia } from "pinia";
import * as VueRouter from 'vue-router'
import Dashboard from './components/Dashboard/ClassControl/ClassControlMain.vue'
import TheDashboard from './pages/dashboard/Dashboard.vue'
import Account from './components/Dashboard/Account/AccountMain.vue'
import './assets/main.css'

const app = createApp(TheDashboard);
app.use(createPinia());

const routes = [
    { name: 'dashboard', path: '/', component: Dashboard },
    { name: 'account', path: '/account', component: Account },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
})

app.use(router)

app.mount('#app');

