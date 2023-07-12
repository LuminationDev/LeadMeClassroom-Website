<script setup lang="ts">
import ClassControlClassArea from "./ClassControlClassArea.vue";
import ClassControlStudentGrid from "./ClassControlStudentGrid.vue";
import { onMounted, ref } from "vue";
import ClassroomOnboarding from "@/components/Classroom/ClassroomOnboarding.vue";
import { useStorage } from "@/hooks/useStorage";
import { useActionStore } from "@/stores/actionStore";
import ActionBarShare from "@/components/ActionBar/ActionBarShare.vue";
import ActionBarControl from "@/components/ActionBar/ActionBarControl.vue";

const actionPinia = useActionStore();
const { getLocalStorage } = useStorage();

//Reference to the screen monitor modal to open it externally
const onBoardingRef = ref<InstanceType<typeof ClassroomOnboarding> | null>(null)
function startOnboarding() {
  onBoardingRef.value?.start();
}

onMounted(async () => {
  getLocalStorage("onboarding_completed").then(result => {
    if (result && result === "true") { return; }
    startOnboarding()
  });
});

</script>

<template>
  <div class="relative grow">
    <!--Class Area-->
    <ClassControlClassArea />

    <!--Student Area-->
    <ClassControlStudentGrid />

    <!--Action Area-->
    <Transition name="fade" mode="out-in">
      <!--Controlling users-->
      <div v-if="!actionPinia.selecting && actionPinia.selectedFollowers.length > 0" class="absolute bottom-5 w-full">
        <ActionBarControl class="mx-10"/>
      </div>

      <!--Sharing Content-->
      <div v-else-if="actionPinia.selecting" class="absolute bottom-5 w-full">
        <ActionBarShare class="mx-10"/>
      </div>
    </Transition>

    <!--Onboarding walk-through-->
    <ClassroomOnboarding ref="onBoardingRef" />
  </div>
</template>
