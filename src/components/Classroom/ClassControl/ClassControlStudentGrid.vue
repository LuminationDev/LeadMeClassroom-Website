<script setup lang="ts">
import WebPlaceholder from "./GridItem/StudentPlaceholder.vue";
import type { WebFollower, MobileFollower } from "../../../models";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import ClassControlStudentGridItem from "@/components/Classroom/ClassControl/GridItem/StudentGridItem.vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();
const { webFollowers, mobileFollowers } = storeToRefs(classroomPinia)

const sortedWebFollowers = computed((): Array<WebFollower> => {
  return webFollowers.value.slice().sort((a: WebFollower, b: WebFollower) => {
    return a.name.localeCompare(b.name)
  });
});

const sortedMobileFollowers = computed((): Array<MobileFollower> => {
  return mobileFollowers.value.slice().sort((a: MobileFollower, b: MobileFollower) => {
    return a.name.localeCompare(b.name)
  });
});

</script>

<template>
  <div class="mt-8 ml-3 lg:ml-10">
    <!--No active students-->
    <div v-if="webFollowers.length === 0 && mobileFollowers.length === 0">
      <WebPlaceholder class="mr-4 mt-4" />
    </div>

    <!--Active students-->
    <div v-if="webFollowers.length !== 0 || mobileFollowers.length !== 0">
      <div id="studentGrid" class="flex flex-row flex-wrap">
        <ClassControlStudentGridItem
            class="mr-0 md:mr-4 mt-4"
            v-for="follower in sortedWebFollowers"
            :key="follower.getUniqueId()"
            :selected="actionPinia.selectedFollowers.includes(follower)"
            @selection-toggled="(value) => { actionPinia.handleFollowerSelection(follower, value) }"
            :follower="follower"/>

        <ClassControlStudentGridItem
            class="mr-4 mt-4"
            v-for="follower in sortedMobileFollowers"
            :key="follower.getUniqueId()"
            :selected="actionPinia.selectedFollowers.includes(follower)"
            @selection-toggled="(value) => { actionPinia.handleFollowerSelection(follower, value) }"
            :follower="follower"/>
      </div>
    </div>
  </div>
</template>
