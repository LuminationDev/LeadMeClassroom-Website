<script setup lang="ts">
import { useClassroomStore } from "@/stores/classroomStore";
import { ref } from "vue";
import type { PropType } from "vue";
import type { Follower } from "@/models";
import * as REQUESTS from "@/constants/_requests";
import RemoveIcon from "@/assets/vue/RemoveIcon.vue";
import WebFollowerIcon from "@/assets/vue/WebFollowerIcon.vue";
import MobileFollowerIcon from "@/assets/vue/MobileFollowerIcon.vue";
import CheckboxInput from "@/components/InputFields/CheckboxInput.vue";

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
const removing = ref(false);

/**
 * Remove the follower from the class.
 */
const kickFollower = () => {
  removing.value = true;
  classroomPinia.endIndividualSession(props.follower.getUniqueId(), props.follower.type);

  //Set a timeout so that the user can be removed even if there is no response.
  setTimeout(() => {
    classroomPinia.updateFollowerData(props.follower.getUniqueId(), props.follower.type, 'disconnected', true);
  }, 4000);
}
</script>

<template>
  <div class="flex flex-row justify-between">
    <span class="text-lg font-medium text-[#BDC3D6]">{{ follower.name }}</span>
    <div class="flex flex-row">
      <WebFollowerIcon v-if="follower.type === REQUESTS.WEB" class="h-6 w-6 mr-2" :colour="'#BDC3D6'" />
      <MobileFollowerIcon v-else-if="follower.type === REQUESTS.MOBILE" class="h-6 w-6 mr-2" :colour="'#BDC3D6'" />
      <CheckboxInput class="opacity-50" @click.stop />
    </div>
  </div>

  <div v-on:click="kickFollower" class="mt-4 h-10 py-2 px-4 flex flex-row items-center justify-center cursor-pointer bg-white text-center rounded-3xl hover:bg-gray-50">
    <div v-if="!removing" class="flex flex-row items-center">
      <RemoveIcon class="h-4" :colour="'red'"/>
      <div class="text-red-500 text-sm font-semibold">
        Remove User
      </div>
    </div>

    <span v-else class="lds-dual-ring h-5 w-5 menu-item-icon menu-item-icon--spinner"></span>
  </div>

  <div class="flex flex-row justify-center items-center h-5 mt-3 mr-2">
    <div v-on:click="$emit('changePanel', 'settings')" class="text-gray-500 text-sm cursor-pointer hover:text-gray-400">
      Cancel
    </div>
  </div>
</template>
