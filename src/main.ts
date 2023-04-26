import { createApp } from 'vue'
import { createPinia } from "pinia";
import * as VueRouter from 'vue-router'
import ClassControl from './components/Dashboard/ClassControl/ClassControlMain.vue'
import Dashboard from './pages/dashboard/Dashboard.vue'
import Account from './components/Dashboard/Account/AccountMain.vue'
import LoginBase from './components/Dashboard/Login/LoginBase.vue'
import './assets/main.css'
import {getAuth} from "@firebase/auth";

const app = createApp(Dashboard);
app.use(createPinia());

const routes = [
    { name: 'dashboard', path: '/', component: ClassControl },
    { name: 'login', path: '/login', component: LoginBase },
    { name: 'account', path: '/account', component: Account },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes
})

router.beforeEach(async (to, from) => {
    const auth = getAuth() // todo - move this to store
    const user = auth.currentUser
    if (
        !user &&
        to.name !== 'login'
    ) {
        // redirect the user to the login page
        return { name: 'login' }
    }
})

app.use(router)

app.mount('#app');

