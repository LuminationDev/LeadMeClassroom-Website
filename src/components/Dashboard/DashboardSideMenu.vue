<script setup lang="ts">
import DashboardMenuItem from "../../components/Dashboard/DashboardMenuItem.vue";
import { useDashboardStore } from "../../stores/dashboardStore";
import { usePopupStore } from "../../stores/popupStore";
import {computed, onBeforeMount, onBeforeUnmount, ref} from "vue";
import logoutIconUrl from '/src/assets/img/menu-icon-logout.svg'
import accountIconUrl from '/src/assets/img/menu-icon-account.svg'
import dashboardIconUrl from '/src/assets/img/menu-icon-dashboard.svg'
const popupPinia = usePopupStore();
const dashboardPinia = useDashboardStore();

const hidden = ref(false)

const screenSize = ref(window.innerWidth)

onBeforeMount(() => {
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
})

const resizeHandler = (e: UIEvent) => {
  screenSize.value = (e?.currentTarget as Window)?.innerWidth
}

const showSidebar = computed(() => {
  return hidden.value || screenSize.value > 1024
})

</script>

<template>
  <div class="lg:hidden absolute top-3 left-2" @click="() => { hidden = !hidden }">
    <img class="w-8 h-8" src="/src/assets/icons/hamburger.svg" alt="Menu button"/>
  </div>
  <Transition name="fade">
    <div v-if="showSidebar" class="lg:hidden absolute w-screen h-screen opacity-80 bg-gray-200 z-40" @click="() => { hidden = !hidden }"></div>
  </Transition>
  <div class="lg:block w-56 self-start h-screen lg:sticky fixed top-0 left-0 bg-navy-side-menu ease-in-out duration-300 z-40"
    :class="{ '-translate-x-full': !showSidebar, 'translate-x-0': showSidebar }">
    <div class="lg:hidden absolute right-2 top-6" @click="() => { hidden = !hidden }">
      <img class="w-8 h-8" src="/src/assets/icons/chevron_left.svg" alt="Menu button"/>
    </div>
    <div>
      <img class="w-28 h-14 ml-6 pt-6 mb-4" src="/src/assets/img/icon-dashboard-logo.svg" alt="LeadMe Icon"/>
      <hr class="mx-5 border border-gray-menu-separator">
    </div>

    <!--Content options-->
    <div class="mt-28 child:mb-6">
      <DashboardMenuItem :icon="dashboardIconUrl" view="/">Dashboard</DashboardMenuItem>
      <DashboardMenuItem :icon="accountIconUrl" view="/account">Account</DashboardMenuItem>
    </div>

    <!--End the active session and logout-->
    <DashboardMenuItem
        :icon="logoutIconUrl" class="fixed bottom-12"
        v-on:click="dashboardPinia.endSession(); popupPinia.handleLogoutClick()"
        view="/"
    >Log Out</DashboardMenuItem>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
