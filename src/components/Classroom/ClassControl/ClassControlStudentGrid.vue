<script setup lang="ts">
import WebPlaceholder from "./GridItem/StudentPlaceholder.vue";
import WebGridItem from "./GridItem/Web/WebGridItem.vue";
import MobileGridItem from "./GridItem/Mobile/MobileGridItem.vue";
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

/** Only count followers that are connected within the active students number. */
const activeWebFollowers = computed((): number => {
  const active = webFollowers.value.filter(follower => {
    return !follower.disconnected
  })

  return active.length;
});

const sortedMobileFollowers = computed((): Array<MobileFollower> => {
  return mobileFollowers.value.slice().sort((a: MobileFollower, b: MobileFollower) => {
    return a.name.localeCompare(b.name)
  });
});

const activeMobileFollowers = computed((): number => {
  const active = mobileFollowers.value.filter(follower => {
    return !follower.disconnected
  })

  return active.length;
});
</script>

<template>
  <div class="mt-14 ml-10">
    <!--No active students-->
    <div v-if="webFollowers.length === 0 && mobileFollowers.length === 0">
      <p class="text-base text-black">
        Active Students
        <span v-if="activeWebFollowers !== 0">
          ({{ activeWebFollowers }})
        </span>
      </p>

      <WebPlaceholder class="mr-4 mt-4" />
    </div>

    <!--Active web students-->
    <div v-if="webFollowers.length !== 0">
      <p class="text-base text-black">
        Active Web Students
        <span v-if="activeWebFollowers !== 0">
          ({{ activeWebFollowers }})
        </span>
      </p>

      <div id="studentGrid" class="flex flex-row flex-wrap">
        <!--Student Web Grid Item (Active student)-->
        <WebGridItem
            class="mr-4 mt-4"
            v-for="follower in sortedWebFollowers"
            :key="follower.getUniqueId()"
            :webFollower="follower"/>

        <ClassControlStudentGridItem
            class="mr-4 mt-4"
            v-for="follower in sortedWebFollowers"
            :key="follower.getUniqueId()"
            :selected="actionPinia.selectedFollowers.includes(follower)"
            @selection-toggled="(value) => { actionPinia.handleFollowerSelection(follower, value) }"
            :follower="follower"/>
      </div>
    </div>

    <!--Active mobile students-->
    <div v-if="mobileFollowers.length !== 0">
      <p class="text-base text-black mt-5">
        Active Mobile Students
        <span v-if="activeMobileFollowers !== 0">
          ({{ activeMobileFollowers }})
        </span>
      </p>

      <div id="studentGrid" class="flex flex-row flex-wrap">
        <!--Student Mobile Grid Item (Active student)-->
        <MobileGridItem
            class="mr-4 mt-4"
            v-for="follower in sortedMobileFollowers"
            :key="follower.getUniqueId()"
            :mobileFollower="follower"/>

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
