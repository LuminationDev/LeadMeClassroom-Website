<script setup lang="ts">
import { computed } from "vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import {storeToRefs} from "pinia";

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();
const { webFollowers, mobileFollowers } = storeToRefs(classroomPinia)

const activeWebFollowers = computed((): number => {
  const active = webFollowers.value.filter(follower => {
    return !follower.disconnected
  })

  return active.length;
});

const activeMobileFollowers = computed((): number => {
  const active = mobileFollowers.value.filter(follower => {
    return !follower.disconnected
  })

  return active.length;
});

const calcStudent = computed(() => {
  if (actionPinia.selectedFollowers.length > 0) {
    return `${actionPinia.selectedFollowers.length} Selected`
  } else {
    return `${activeMobileFollowers.value + activeWebFollowers.value} Students`;
  }
});

const selectAll = () => {
  //Select all users
  classroomPinia.mobileFollowers.forEach(follower => {
    actionPinia.handleFollowerSelection(follower, true);
  });

  //Web users cannot handle local videos or apps
  if(actionPinia.shareType !== "video" && actionPinia.shareType !== "app") {
    classroomPinia.webFollowers.forEach(follower => {
      actionPinia.handleFollowerSelection(follower, true);
    });
  }
}
</script>

<template>
  <div class="mt-20 px-3 lg:px-5 lg:px-10 sticky top-0 w-full py-4 bg-panel-background">
    <div class="flex flex-row justify-between items-center">
      <p class="text-3xl lg:ml-5 font-medium" v-if="classroomPinia.user">{{
          classroomPinia.user?.displayName
        }}'{{ classroomPinia?.user?.displayName?.endsWith('s') ? '' : 's' }} Class</p>

      <div class="flex flex-row mr-16">
        <Transition name="fade">
          <div v-if="actionPinia.selectedFollowers.length > 0 && (activeMobileFollowers + activeWebFollowers) > 1" v-on:click="selectAll" class="flex items-center justify-center w-auto mr-4 text-blue-500 cursor-pointer">
            Select All
          </div>
        </Transition>

        <div class="flex items-center justify-center h-8 w-60 rounded-2xl"
            :class="{
              'bg-blue-200 text-blue-500': actionPinia.selectedFollowers.length > 0,
              'bg-white border border-1 border-gray-300 text-gray-500': actionPinia.selectedFollowers.length === 0
            }"
        >
          {{calcStudent}}
        </div>
      </div>
    </div>
  </div>
</template>
