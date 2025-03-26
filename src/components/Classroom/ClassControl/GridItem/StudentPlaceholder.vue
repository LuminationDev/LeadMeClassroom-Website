<script setup lang="ts">
import {computed} from "vue";
import {useClassroomStore} from "@/stores/classroomStore";
const classroomPinia = useClassroomStore();

const classCode = computed(() => {
  return classroomPinia.classCode !== ''
})
</script>

<template>
  <div class="w-64" id="student_placeholder">
    <div class="h-36 w-full flex flex-col justify-center items-center bg-zinc-200 rounded-xl text-gray-400 text-lg text-center px-8">
      <div class="mb-2">No active students!</div>
      <div>{{ classCode ? 'Share room code with your class.' : 'Start a class and invite students.' }}</div>
    </div>
  </div>
</template>
