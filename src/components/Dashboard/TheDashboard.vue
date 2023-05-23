<script setup lang="ts">
import DashboardSideMenu from "./DashboardSideMenu.vue";
import DashboardTitleBar from "./DashboardTitleBar.vue";
import { onBeforeMount, onMounted, ref } from "vue";
import { getAuth } from "@firebase/auth";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useRouter } from "vue-router";

const dashboardPinia = useDashboardStore();
const router = useRouter()
const emailVerified = ref(false)

//Check for any active class on load
onMounted(async () => {
  const auth = getAuth()
  dashboardPinia.user = auth.currentUser
  if (dashboardPinia.user) {
    emailVerified.value = dashboardPinia.user.emailVerified
  }
  await dashboardPinia.attachClassListeners(true)
});

onBeforeMount(() => {
  router.push({
    name: 'dashboard'
  });
});
</script>

<template>
  <div class="flex font-poppins">
    <!--SideMenu-->
    <DashboardSideMenu v-if="dashboardPinia.user" />

    <div v-if="emailVerified" class="flex flex-grow flex-col h-screen">
      <div class="flex flex-grow flex-col h-screen">
        <!--TitleBar-->
        <DashboardTitleBar v-if="dashboardPinia.user" />

        <!--MainArea-->
        <div class="flex flex-col flex-grow bg-panel-background font-poppins overflow-hidden">
          <router-view />
        </div>
      </div>
    </div>
    <div v-else class="flex justify-center items-center w-full">
      Your email is not verified. Please verify it to continue.
    </div>
  </div>
</template>
