<script setup lang="ts">
import * as REQUESTS from "@/constants/_requests";
import EyeIcon from "@/assets/vue/EyeIcon.vue";
import LockIcon from "@/assets/vue/LockIcon.vue";
import RemoveIcon from "@/assets/vue/RemoveIcon.vue";
import {computed, defineProps, PropType} from "vue";
import { Follower } from "@/models";
import { useClassroomStore } from "@/stores/classroomStore";
import UnlockIcon from "@/assets/vue/UnlockIcon.vue";

defineEmits<{
    (e: 'changePanel', value: string): void
}>();

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  }
});

const classroomPinia = useClassroomStore();

/**
 * Lock or unlock the followers screen. Updating the base model after the command
 * has been sent.
 */
const lockUnlockScreen = () => {
  classroomPinia.lockScreens(props.follower, props.follower.locked);
}

const lockedText = computed(() => {
  return props.follower.locked ? 'Unlock Screen' : 'Lock Screen';
});
</script>

<template>
  <div class="flex flex-col h-24">
    <div v-if="follower.type === REQUESTS.WEB" class="flex flex-row h-7 items-center hover:bg-white cursor-pointer rounded-xl px-1 mb-2">
      <EyeIcon class="h-5" :colour="'black'"/>
      <span class="ml-2 font-semibold text-sm">View Screen</span>
    </div>

    <div v-on:click="lockUnlockScreen" class="flex flex-row items-center hover:bg-white h-7 cursor-pointer rounded-xl px-1 mb-2">
      <UnlockIcon v-if="follower.locked" class="h-5" :colour="'black'"/>
      <LockIcon v-else class="h-5" :colour="'black'"/>
      <span class="ml-2 font-semibold text-sm">{{lockedText}}</span>
    </div>

    <div v-on:click="$emit('changePanel', 'confirm')" class="flex flex-row h-7 items-center hover:bg-white cursor-pointer rounded-xl px-1">
      <RemoveIcon class="h-5" :colour="'black'"/>
      <span class="ml-2 font-semibold text-sm">Remove User</span>
    </div>
  </div>

  <div class="flex flex-row justify-end items-center h-5 mr-2">
    <img v-on:click="$emit('changePanel', 'main')" class="cursor-pointer" src="/src/assets/img/cross.svg" alt="cross"/>
  </div>
</template>
