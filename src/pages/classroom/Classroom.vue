<script setup lang="ts">
import TheClassroom from "../../components/Classroom/TheClassroom.vue";
import {useClassroomStore} from "@/stores/classroomStore";
import {onMounted, ref} from "vue";
const classroomPinia = useClassroomStore();
const loaded = ref(false)
onMounted(async () => {
  await classroomPinia.loadLeaderDetails().then(() => {
    loaded.value = true
  })
})
</script>

<template>
  <TheClassroom v-if="loaded" />
</template>
