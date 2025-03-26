import { createApp } from 'vue'
import { createPinia } from "pinia";
import * as VueRouter from 'vue-router';
import ClassControl from './components/Classroom/ClassControl/ClassControlMain.vue';
import Classroom from './pages/classroom/Classroom.vue';
import Account from './components/Classroom/Account/AccountMain.vue';
import LoginBase from './components/Classroom/Login/LoginBase.vue';
import './assets/main.css';
import { getAuth } from "@firebase/auth";

const app = createApp(Classroom);
app.use(createPinia());

const routes = [
    { name: 'classroom', path: '/', component: ClassControl },
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
        (!user || !user.emailVerified) &&
        to.name !== 'login'
    ) {
        // redirect the user to the login page
        return { name: 'login' }
    }
    if (
        (user && user.emailVerified) &&
        to.name === 'login'
    ) {
        // redirect the user to the login page
        return { name: 'classroom' }
    }
})

app.use(router)

app.mount('#app');

