<script setup lang="ts">
import DashboardOnboarding from "./DashboardOnboarding.vue";
import DashboardSideMenu from "./DashboardSideMenu.vue";
import DashboardTitleBar from "./DashboardTitleBar.vue";
import { onMounted, ref, onBeforeMount } from "vue";
import { getAuth, User } from "@firebase/auth";

import { useDashboardStore } from "../../stores/dashboardStore";
import {useRouter} from "vue-router";
import LoginBase from "@/components/Dashboard/Login/LoginBase.vue";
const dashboardPinia = useDashboardStore();
const router = useRouter()

const emailVerified = ref(false)
const currentUser = ref<User|null>(null)

//Reference to the screen monitor modal to open it externally
const childRef = ref<InstanceType<typeof DashboardOnboarding> | null>(null)
function startOnboarding() {
  childRef.value?.start();
}

//Check for any active class on load
onMounted(() => {
  const auth = getAuth()
  currentUser.value = auth.currentUser
  if (currentUser.value) {
    emailVerified.value = currentUser.value.emailVerified
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
    <DashboardSideMenu v-if="currentUser" />

    <div v-if="emailVerified" class="flex flex-grow flex-col h-screen">
      <!--TitleBar-->
      <DashboardTitleBar />

      <!--MainArea-->
      <div class="flex flex-col flex-grow bg-panel-background font-poppins overflow-hidden">
        <router-view />
      </div>
    </div>
    <div v-else-if="!currentUser" class="w-full bg-panel-background h-screen flex justify-center items-center">
      <LoginBase />
    </div>
    <div v-else class="flex justify-center items-center w-full">
      Your email is not verified. Please verify it to continue.
      {{ getAuth().currentUser }}
    </div>

<!--    <DashboardOnboarding ref="childRef" />-->
  </div>
</template>
