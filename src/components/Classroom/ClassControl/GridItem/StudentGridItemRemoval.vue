<script setup lang="ts">
import { useClassroomStore } from "@/stores/classroomStore";
import { defineProps, PropType } from "vue";
import { Follower } from "@/models";

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
 * Remove the follower from the class.
 */
const kickFollower = () => {
  classroomPinia.endIndividualSession(props.follower.getUniqueId(), props.follower.type);
}
</script>

<template>
  <div class="h-24">
    Are you sure you want to remove {{follower.name}}

    <!--TODO temporary placeholder-->
    <div v-on:click="kickFollower" class="mx-5 mt-3 cursor-pointer bg-gray-300 text-center rounded-xl hover:bg-white">
      Confirm
    </div>
  </div>

  <div class="flex flex-row justify-end items-center h-5 mr-2">
    <img v-on:click="$emit('changePanel', 'settings')" class="cursor-pointer" src="/src/assets/img/cross.svg" alt="cross"/>
  </div>
</template>
