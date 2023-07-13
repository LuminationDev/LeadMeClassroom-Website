<script setup lang="ts">
import * as REQUESTS from "@/constants/_requests";
import NameIcon from "@/assets/vue/NameIcon.vue";
import EyeIcon from "@/assets/vue/EyeIcon.vue";
import LockIcon from "@/assets/vue/LockIcon.vue";
import RemoveIcon from "@/assets/vue/RemoveIcon.vue";
import { defineProps, PropType } from "vue";
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
  //Send the command
  classroomPinia.requestAction({
    type: REQUESTS.SCREENCONTROL,
    action: props.follower.locked ? REQUESTS.UNBLOCK : REQUESTS.BLOCK
  }, props.follower.type);

  classroomPinia.updateFollowerData(
      props.follower.getUniqueId(),
      props.follower.type,
      'locked',
      !props.follower.locked);
}
</script>

<template>
  <div class="flex flex-col h-24">
    <div v-on:click="$emit('changePanel', 'name')" class="flex flex-row items-center hover:bg-white cursor-pointer rounded-xl px-1 mb-1">
      <NameIcon class="h-5" :colour="'black'"/>
      <span class="ml-2 font-semibold text-sm">Rename User</span>
    </div>

    <div v-if="follower.type === REQUESTS.WEB" class="flex flex-row items-center hover:bg-white cursor-pointer rounded-xl px-1 mb-1">
      <EyeIcon class="h-5" :colour="'black'"/>
      <span class="ml-2 font-semibold text-sm">View Screen</span>
    </div>

    <div v-on:click="lockUnlockScreen" class="hover:bg-white cursor-pointer rounded-xl px-1 mb-1">
      <div v-if="follower.locked" class="flex flex-row items-center">
        <UnlockIcon class="h-5" :colour="'black'"/>
        <span class="ml-2 font-semibold text-sm">Unlock Screen</span>
      </div>
      <div v-else class="flex flex-row items-center">
        <LockIcon class="h-5" :colour="'black'"/>
        <span class="ml-2 font-semibold text-sm">Lock Screen</span>
      </div>
    </div>

    <div v-on:click="$emit('changePanel', 'confirm')" class="flex flex-row items-center hover:bg-white cursor-pointer rounded-xl px-1">
      <RemoveIcon class="h-5" :colour="'black'"/>
      <span class="ml-2 font-semibold text-sm">Remove User</span>
    </div>
  </div>

  <div class="flex flex-row justify-end items-center h-5 mr-2">
    <img v-on:click="$emit('changePanel', 'main')" class="cursor-pointer" src="src/assets/img/cross.svg" alt="cross"/>
  </div>
</template>
