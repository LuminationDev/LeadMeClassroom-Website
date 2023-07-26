<script setup lang="ts">
import ClassroomSideMenu from "./SideMenu/ClassroomSideMenu.vue";
import {computed, onBeforeMount, onMounted, ref} from "vue";
import { getAuth } from "@firebase/auth";
import { useClassroomStore } from "@/stores/classroomStore";
import { useRouter } from "vue-router";
import {useStorage} from "@/hooks/useStorage";
import ClassroomOnboarding from "@/components/Classroom/ClassroomOnboarding.vue";

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

const { getLocalStorage } = useStorage();

//Reference to the screen monitor modal to open it externally
const onBoardingRef = ref<InstanceType<typeof ClassroomOnboarding> | null>(null)
function startOnboarding() {
  onBoardingRef.value?.start();
}

function checkOnboarding() {
  getLocalStorage("onboarding_completed").then(result => {
    if (result && result === "true") { return; }
    startOnboarding()
  });
}
</script>

<template>
  <div class="flex font-poppins h-full">
    <!--Onboarding walk-through-->
    <ClassroomOnboarding ref="onBoardingRef" />
    <!--SideMenu-->
    <ClassroomSideMenu v-if="emailVerified" @vue:mounted="checkOnboarding"/>

    <div class="flex flex-grow flex-col h-full">
      <!--MainArea-->
      <div class="bg-navy-side-menu h-6 w-full z-30"></div>
      <div class="flex flex-col flex-grow bg-panel-background font-poppins overflow-hidden">
        <router-view />
      </div>
    </div>
  </div>
</template>