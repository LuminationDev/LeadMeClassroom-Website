<script setup lang="ts">
import ClassroomSideMenu from "./SideMenu/ClassroomSideMenu.vue";
import { onBeforeMount, onMounted, ref } from "vue";
import { getAuth } from "@firebase/auth";
import { useClassroomStore } from "@/stores/classroomStore";
import { useRouter } from "vue-router";

const classroomPinia = useClassroomStore();
const router = useRouter()
const emailVerified = ref(false)
const loaded = ref(false)

// todo this runs on the login page, so does not re-run when logging in (first time load the sidemenu does not appear)
//Check for any active class on load
onMounted(async () => {
  classroomPinia.loadCuratedContent()
  await classroomPinia.onLoad()
  await classroomPinia.attachClassListeners(true)
  const auth = getAuth()

  classroomPinia.user = auth.currentUser
  if (classroomPinia.user) {
    emailVerified.value = classroomPinia.user.emailVerified
  }
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
      <div class="flex flex-grow flex-col h-screen">
        <!--MainArea-->
        <div class="flex flex-col flex-grow bg-panel-background font-poppins overflow-hidden">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
