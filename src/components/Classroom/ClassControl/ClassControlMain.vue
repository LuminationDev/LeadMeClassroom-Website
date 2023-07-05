<script setup lang="ts">
import ClassControlClassArea from "./ClassControlClassArea.vue";
import ClassControlStudentGrid from "./ClassControlStudentGrid.vue";
import {onMounted, ref} from "vue";
import ClassroomOnboarding from "@/components/Classroom/ClassroomOnboarding.vue";
import {useStorage} from "@/hooks/useStorage";

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
  <div>
    <!--Class Area-->
    <ClassControlClassArea />

    <!--Student Area-->
    <ClassControlStudentGrid />

    <ClassroomOnboarding ref="onBoardingRef" />
  </div>
</template>
