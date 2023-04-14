import { createApp } from 'vue'
import { createPinia } from "pinia";
import * as VueRouter from 'vue-router'
import Dashboard from './Dashboard.vue'
import Account from '../../components/Dashboard/Account/AccountMain.vue'

const app = createApp(Dashboard);
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
