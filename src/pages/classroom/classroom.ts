import { createApp } from 'vue'
import { createPinia } from "pinia";
import * as VueRouter from 'vue-router'
import Classroom from './Classroom.vue'
import Account from '../../components/Classroom/Account/AccountMain.vue'

const app = createApp(Classroom);
app.use(createPinia());

const routes = [
    { name: 'classroom', path: '/', component: Classroom },
    { name: 'account', path: '/account', component: Account },
]

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
})

app.use(router)

app.mount('#app');
