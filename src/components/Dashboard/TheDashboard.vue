<script setup lang="ts">
import DashboardSideMenu from "./SideMenu/DashboardSideMenu.vue";
import { onBeforeMount, onMounted, ref } from "vue";
import { getAuth } from "@firebase/auth";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useRouter } from "vue-router";

const dashboardPinia = useDashboardStore();
const router = useRouter()
const emailVerified = ref(false)
const loaded = ref(false)

//Check for any active class on load
onMounted(async () => {
  dashboardPinia.loadCuratedContent()
  await dashboardPinia.onLoad()
  await dashboardPinia.attachClassListeners(true)
  const auth = getAuth()
  dashboardPinia.user = auth.currentUser
  if (dashboardPinia.user) {
    emailVerified.value = dashboardPinia.user.emailVerified
  }
  loaded.value = true
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
    <DashboardSideMenu v-if="emailVerified" />

    <div class="flex flex-grow flex-col h-screen">
      <div class="flex flex-grow flex-col h-screen">
        <!--MainArea-->
        <div class="flex flex-col flex-grow bg-panel-background font-poppins overflow-hidden">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
