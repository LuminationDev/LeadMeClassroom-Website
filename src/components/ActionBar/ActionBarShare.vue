<script setup lang="ts">
import ActionBarBase from "@/components/ActionBar/ActionBarBase.vue";
import selectIconUrl from '/src/assets/img/selection-icon-individual.svg';
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import { computed } from "vue";
import type { UpdateFollowerTasksCallback } from "@/constants/_functionTypes";

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();

const goBack = () => {
  //Reset the action bar
  actionPinia.selecting = false;
  actionPinia.shareType = '';
  actionPinia.selectedFollowers = [];

  //Open the share content model
  actionPinia.showModal = true;
}

const shareContent = () => {
  const updateFollowerTasksCallback: UpdateFollowerTasksCallback = (uniqueId, tasks, followerType) => {
    classroomPinia.updateFollowerTasks(uniqueId, tasks, followerType);
  };

  actionPinia.shareContent(updateFollowerTasksCallback);
}

const shareText = computed(() => {
  switch(actionPinia.shareType) {
    case "website":
      return `Share link with`

    case "curated":
      return `Share ${actionPinia.selectedItems.length} Video${actionPinia.selectedItems.length > 1 ? 's' : ''} with`

      //Only Mobile users can be shared a local video
    case "video":
      return `Share ${actionPinia.selectedItems.length} Video${actionPinia.selectedItems.length > 1 ? 's' : ''} with`

      //Only Mobile users can be shared a local application
    case "app":
      if (actionPinia.selectedItems.length === 1) {
        return `Share ${actionPinia.selectedItems[0].getName()} with`
      } else {
        return `Share ${actionPinia.selectedItems.length} Application${actionPinia.selectedItems.length > 1 ? 's' : ''} with`
      }

    default:
      return 'Share content with'
  }
});
</script>

<template>
  <ActionBarBase>
    <template v-slot:right>
      <div class="flex flex-row items-center">
        <div class="text-white mr-2">
          {{shareText}}
        </div>

        <div :class="{
                'h-9 flex items-center pl-3 pr-4 rounded-3xl text-base text-white': true,
                'cursor-pointer bg-blue-400 hover:bg-blue-300': actionPinia.selectedFollowers.length > 0,
                'bg-blue-400 opacity-50': actionPinia.selectedFollowers.length === 0 }"
             v-on:click="shareContent"
        >
          <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
          <span class="w-auto mr-1">{{actionPinia.selectedFollowers.length}}</span>
          Selected
        </div>

        <div class="h-9 flex items-center ml-2 pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-gray-400 hover:bg-gray-300"
          v-on:click="goBack"
        >
          Back
        </div>
      </div>
    </template>
  </ActionBarBase>
</template>
