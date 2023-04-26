<script setup lang="ts">
import DashboardOnboarding from "./DashboardOnboarding.vue";
import DashboardSideMenu from "./DashboardSideMenu.vue";
import DashboardTitleBar from "./DashboardTitleBar.vue";
import { onMounted, ref, onBeforeMount } from "vue";
import { getAuth, User } from "@firebase/auth";

import { useDashboardStore } from "../../stores/dashboardStore";
import {useRouter} from "vue-router";
const dashboardPinia = useDashboardStore();
const router = useRouter()

const emailVerified = ref(false)

//Reference to the screen monitor modal to open it externally
const childRef = ref<InstanceType<typeof DashboardOnboarding> | null>(null)
function startOnboarding() {
  childRef.value?.start();
}

//Check for any active class on load
onMounted(() => {
  const auth = getAuth()
  dashboardPinia.user = auth.currentUser
  if (dashboardPinia.user) {
    emailVerified.value = dashboardPinia.user.emailVerified
  }
  dashboardPinia.attachClassListeners(true)

  // todo
  // startOnboarding()
  // getSyncStorage("onboarding_completed").then(result => {
  //   // if (result && result === true) { return; }
  //   startOnboarding()
  // });
});

onBeforeMount(() => {
  router.push({
    name: 'dashboard'
  });
})

</script>

<template>
  <div class="flex font-poppins">
    <!--SideMenu-->
    <DashboardSideMenu v-if="dashboardPinia.user" />

    <div class="flex flex-grow flex-col h-screen">
      <!--TitleBar-->
      <DashboardTitleBar v-if="dashboardPinia.user" />

      <!--MainArea-->
      <div class="flex flex-col flex-grow bg-panel-background font-poppins overflow-hidden">
        <router-view />
      </div>
    </div>
  </div>
</template>
