<script setup lang="ts">
import { useClassroomStore } from "@/stores/classroomStore";
import {defineProps, PropType, ref} from "vue";
import { Follower } from "@/models";
import * as REQUESTS from "@/constants/_requests";
import EllipsisIcon from "@/assets/vue/EllipsisIcon.vue";
import WebFollowerIcon from "@/assets/vue/WebFollowerIcon.vue";
import MobileFollowerIcon from "@/assets/vue/MobileFollowerIcon.vue";
import CheckboxInput from "@/components/InputFields/CheckboxInput.vue";
import DisconnectIcon from "@/assets/vue/Student/DisconnectIcon.vue";
import CrossIcon from "@/assets/vue/CrossIcon.vue";

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
const hover = ref(false);

const removeFollower = () => {
  setTimeout(() => {
    classroomPinia.removeFollower(props.follower.getUniqueId(), props.follower.type);
    classroomPinia.removeFollowerData(props.follower.getUniqueId(), props.follower.type);
  }, 500)
}
</script>

<template>
  <div @mouseenter="hover = true" @mouseleave="hover = false" class="bg-gray opacity-50 flex flex-col flex-grow">
    <div>
      <div class="flex flex-row justify-between">
        <span class="text-lg font-medium">{{ follower.name }}</span>
        <div class="flex flex-row">
          <div class="flex flex-row">
            <WebFollowerIcon v-if="follower.type === REQUESTS.WEB" class="h-6 w-6 mr-2" :colour="'#BDC3D6'" />
            <MobileFollowerIcon v-else-if="follower.type === REQUESTS.MOBILE" class="h-6 w-6 mr-2" :colour="'#BDC3D6'" />
            <CheckboxInput />
          </div>
        </div>
      </div>

      <div class="rounded-full text-gray-500 mt-4 mb-3 bg-white relative">
        <div class="flex flex-row items-center font-medium h-10">
          <div v-if="hover" v-on:click="removeFollower" class="flex flex-row items-center justify-center cursor-pointer w-full py-2 px-4">
            <CrossIcon class="mr-2" :colour="'black'"/>
            Dismiss
          </div>
        </div>
        <DisconnectIcon v-if="!hover" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16" :colour="'gray'"/>
      </div>
      <div class="flex flex-row justify-end">
        <EllipsisIcon class="h-5" :colour="'#BDC3D6'"/>
      </div>
    </div>
  </div>
</template>
