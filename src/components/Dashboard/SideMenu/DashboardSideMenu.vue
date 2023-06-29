<script setup lang="ts">
import DashboardMenuItem from "./DashboardMenuItem.vue";
import { useDashboardStore } from "@/stores/dashboardStore";
import {computed, onBeforeMount, onBeforeUnmount, ref} from "vue";
import classroomIconUrl from '/src/assets/img/sideMenu/menu-icon-classroom.svg';
import endClassIconUrl from '/src/assets/img/sideMenu/menu-icon-endclass.svg';
import GenericButton from "@/components/Buttons/GenericButton.vue";
import DashboardActions from "@/components/Dashboard/SideMenu/DashboardActions.vue";

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

const classCode = computed(() => {
  return dashboardPinia.classCode !== ''
})

async function endSession() {
  await dashboardPinia.endSession();
}

async function generateSession() {
  await dashboardPinia.generateSession();
}
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

    <!--Class Code-->
    <div class="mt-5 flex justify-center">
      <button
          v-if="classCode"
          class="h-12 w-48 bg-blue-500
          text-sm text-white font-poppins font-semibold
          rounded-md"
      >Room Code: {{ dashboardPinia.classCode }}</button>

      <GenericButton
          v-else
          id="generate_class"
          class="h-12 w-48 bg-violet-500
          text-sm text-white font-poppins font-medium
          rounded-md"
          :callback="generateSession"
      >Start a Class</GenericButton>
    </div>

    <!--Content options-->
    <div class="mt-8 child:mb-3">
      <DashboardMenuItem :icon="classroomIconUrl" :enabled="classCode" view="/">Classroom</DashboardMenuItem>
      <DashboardActions />
    </div>

    <!--End the active session and logout-->
    <DashboardMenuItem
        :icon="endClassIconUrl" class="fixed bottom-12"
        :enabled="classCode"
        v-on:click="endSession()"
        view="/"
    >End Class</DashboardMenuItem>
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
