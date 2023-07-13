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

const removeFollower = () => {
  setTimeout(() => {
    classroomPinia.removeFollower(props.follower.getUniqueId(), props.follower.type)
  }, 500)
}
</script>

<template>
  <div class="h-24">
    {{follower.name}} Has disconnected

    <!--TODO temporary placeholder-->
    <div v-on:click="removeFollower" class="cursor-pointer hover:bg-white">
      Dismiss
    </div>
  </div>

  <div class="flex flex-row justify-end items-center h-5 mr-2">
  </div>
</template>
