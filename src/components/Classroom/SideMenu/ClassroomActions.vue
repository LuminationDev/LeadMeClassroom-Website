<script setup lang="ts">
import lockIconUrl from '/src/assets/img/sideMenu/menu-icon-lock.svg';
import {computed, ref} from "vue";
import {useClassroomStore} from "@/stores/classroomStore";
import ShareContentModal from "@/components/Modals/ShareContent/ShareContentModal.vue";
import * as REQUESTS from "@/constants/_requests";
import { storeToRefs } from "pinia";

const classroomPinia = useClassroomStore();
const { webFollowers, mobileFollowers } = storeToRefs(classroomPinia);

const classCode = computed(() => {
  return classroomPinia.classCode !== '' && classroomPinia.view === 'classroom'
})

// Screen control area
const loading = ref(false);
const locked = ref(false);
async function screenControl() {
  if ((webFollowers.value.length === 0 && mobileFollowers.value.length === 0) || classroomPinia.view !== 'classroom') {
    return;
  }

  loading.value = true;
  await new Promise(res => setTimeout(res, 500));
  locked.value = !locked.value;
  loading.value = false;
  classroomPinia.requestAction({ type: REQUESTS.SCREENCONTROL, action: locked.value ? REQUESTS.BLOCK : REQUESTS.UNBLOCK }, REQUESTS.WEB);
  classroomPinia.requestAction({ type: REQUESTS.SCREENCONTROL, action: locked.value ? REQUESTS.BLOCK : REQUESTS.UNBLOCK }, REQUESTS.MOBILE);

  //Update all followers
  classroomPinia.webFollowers.forEach(follower => {
    follower.locked = locked.value;
  });

  classroomPinia.mobileFollowers.forEach(follower => {
    follower.locked = locked.value;
  });
}
</script>

<template>
  <!--Sharing content-->
  <ShareContentModal />

  <!--Screen lock/unlock-->
  <button
      :class="{
        'w-full flex items-center rounded-lg font-light': true,
        'cursor-pointer': classCode,
        'cursor-default': !classCode,
        'hover:bg-white-menu-overlay': classCode,
      }"
    :disabled="loading"
    v-on:click="screenControl();"
  >
    <span v-if="loading" class="flex flex-row menu-item">
      <span class="lds-dual-ring-screen h-5 w-5 menu-item-icon menu-item-icon--spinner"></span>
      <span class="menu-item-text" :class="{
        'text-base': true,
        'text-white': classCode,
        'text-gray-400': !classCode
      }">
        {{locked ? 'Unlocking' : 'Locking'}}
      </span>
    </span>

    <div v-else class="flex flex-row justify-center w-full menu-item">
      <img v-if="locked" :class="{
        'w-5 h-5 menu-item-icon': true,
        'contrast-50 brightness-75': !classCode
      }" src="/src/assets/img/session-icon-unlock.svg" alt="Icon"/> <!--TODO get an unlock svg/ask matt what he wants here-->

      <img v-else :class="{
        'w-5 h-5 menu-item-icon': true,
        'contrast-50 brightness-75': !classCode
      }" :src="lockIconUrl" alt="Icon"/>

      <span class="menu-item-text" :class="{
        'text-base': true,
        'text-white': classCode,
        'text-gray-400': !classCode
      }">
        {{locked ? 'Unlock Screens' : 'Lock Screens'}}
      </span>
    </div>
  </button>
</template>
