<script setup lang="ts">
import ActionBarBase from "@/components/ActionBar/ActionBarBase.vue";
import selectIconUrl from '/src/assets/img/selection-icon-individual.svg';
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import { Task } from "@/models";
import {computed} from "vue";

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

const selectAll = () => {
  console.log("Select all users");
}

const shareContent = () => {
  if(actionPinia.shareType === '') {
    return;
  }

  if(actionPinia.selectedFollowers.length === 0) {
    return;
  }

  console.log("SHARE TYPE: " + actionPinia.shareType);

  //TODO might not need the switch case in the future if functions made generic enough
  switch(actionPinia.shareType) {
    case "website":
      console.log("Website link");
      actionPinia.selectedFollowers.forEach(follower => {
        //Update the task list
        follower.tasks = Array.from(new Set(follower.tasks.concat([new Task("Website", actionPinia.websiteURL, "Website")])));
        //TODO TASKS NOT SETUP FOR WEB USERS - MAY RESULT IN WEIRD STUFF
        classroomPinia.updateFollowerTasks(follower.getUniqueId(), follower.tasks.map(app => app.toStringEntry()), follower.type);
      });
      break;

    case "curated":
      console.log("Curated Content");
      actionPinia.selectedFollowers.forEach(follower => {
        //Update the task list
        follower.tasks = Array.from(new Set(follower.tasks.concat(actionPinia.selectedItems)));
        //TODO TASKS NOT SETUP FOR WEB USERS - MAY RESULT IN WEIRD STUFF
        classroomPinia.updateFollowerTasks(follower.getUniqueId(), follower.tasks.map(app => app.toStringEntry()), follower.type);
      });
      break;

    //Only Mobile users can be shared a local video
    case "video":
      console.log("Video");
      break;

    //Only Mobile users can be shared a local application
    case "app":
      console.log("Application");
      break;
  }

  //Clean up the selection and action bar
  actionPinia.selectedFollowers = [];
  actionPinia.selecting = false;
  actionPinia.shareType = '';
}

const shareText = computed(() => {
  switch(actionPinia.shareType) {
    case "website":
      return `Share link with`

    case "curated":
      return `Share ${actionPinia.selectedItems.length} Video${actionPinia.selectedFollowers.length > 1 ? 's' : ''} with`

      //Only Mobile users can be shared a local video
    case "video":
      return `Share ${actionPinia.selectedItems.length} Video${actionPinia.selectedFollowers.length > 1 ? 's' : ''} with`

      //Only Mobile users can be shared a local application
    case "app":
      return `Share ${actionPinia.selectedItems.length} Application${actionPinia.selectedFollowers.length > 1 ? 's' : ''} with`

    default:
      return 'Share content with'
  }
});
</script>

<template>
  <ActionBarBase>
    <template v-slot:left>
      <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
        text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
        v-on:click="selectAll"
      >
        Select All
      </div>
    </template>

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
