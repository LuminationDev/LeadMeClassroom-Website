<script setup lang="ts">
import ClassroomSideMenu from "./SideMenu/ClassroomSideMenu.vue";
import {computed, onBeforeMount, onMounted, ref} from "vue";
import { getAuth } from "@firebase/auth";
import { useClassroomStore } from "@/stores/classroomStore";
import { useRouter } from "vue-router";

const classroomPinia = useClassroomStore();
const router = useRouter()
const loaded = ref(false)

const emailVerified = computed(() => {
  return classroomPinia.user?.emailVerified ?? false
});

//Check for any active class on load
onMounted(async () => {
  classroomPinia.loadCuratedContent()
  await classroomPinia.onLoad()
  await classroomPinia.attachClassListeners(true)
  const auth = getAuth()
  classroomPinia.user = auth.currentUser
  loaded.value = true
});

onBeforeMount(() => {
  router.push({
    name: 'classroom'
  });
});
</script>

<template>
  <div class="flex font-poppins">
    <!--SideMenu-->
    <ClassroomSideMenu v-if="emailVerified" />

    <div class="flex flex-grow flex-col h-screen">
      <!--MainArea-->
      <div class="bg-navy-side-menu h-6 w-full z-30"></div>
      <div class="flex flex-col flex-grow bg-panel-background font-poppins overflow-hidden rounded-tl-xl">
        <router-view />
      </div>
    </div>
  </div>
</template>