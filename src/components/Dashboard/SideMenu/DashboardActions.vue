<script setup lang="ts">
import lockIconUrl from '/src/assets/img/sideMenu/menu-icon-lock.svg';
import {computed, ref} from "vue";
import {useDashboardStore} from "@/stores/dashboardStore";
import ShareContentModal from "@/components/Modals/ShareContent/ShareContentModal.vue";
import * as REQUESTS from "@/constants/_requests";

const dashboardPinia = useDashboardStore();

const classCode = computed(() => {
  return dashboardPinia.classCode !== ''
})

// Screen control area
const loading = ref(false);
const locked = ref(false);
async function screenControl() {
  loading.value = true;
  await new Promise(res => setTimeout(res, 500));
  locked.value = !locked.value;
  loading.value = false;
  dashboardPinia.requestAction({ type: REQUESTS.SCREENCONTROL, action: locked.value ? REQUESTS.BLOCK : REQUESTS.UNBLOCK }, REQUESTS.WEB);
  dashboardPinia.requestAction({ type: REQUESTS.SCREENCONTROL, action: locked.value ? REQUESTS.BLOCK : REQUESTS.UNBLOCK }, REQUESTS.MOBILE);
}
</script>

<template>
  <!--Sharing content-->
  <ShareContentModal />

  <!--Screen lock/unlock-->
  <button
      :class="{
        'h-12 w-48 ml-4 pl-3 flex items-center rounded-lg font-light': true,
        'cursor-pointer': classCode,
        'cursor-default': !classCode,
        'hover:bg-white-menu-overlay': classCode,
      }"
    :disabled="loading"
    v-on:click="screenControl();"
  >
    <span v-if="loading" class="flex flex-row place-items-center">
    <span class="lds-dual-ring-screen h-5 w-5 mr-3"></span>
      <span :class="{
        'text-base': true,
        'text-white': classCode,
        'text-gray-400': !classCode
      }">
        {{locked ? 'Unlocking' : 'Locking'}}
      </span>
    </span>

    <span v-else class="flex flex-row place-items-center">
      <img v-if="locked" :class="{
        'w-5 h-5 mr-3': true,
        'contrast-50 brightness-75': !classCode
      }" src="/src/assets/img/session-icon-unlock.svg" alt="Icon"/> <!--TODO get an unlock svg/ask matt what he wants here-->

      <img v-else :class="{
        'w-5 h-5 mr-3': true,
        'contrast-50 brightness-75': !classCode
      }" :src="lockIconUrl" alt="Icon"/>

      <span :class="{
        'text-base': true,
        'text-white': classCode,
        'text-gray-400': !classCode
      }">
        {{locked ? 'Unlock Screens' : 'Lock Screens'}}
      </span>
    </span>
  </button>
</template>
