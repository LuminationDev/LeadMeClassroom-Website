<script setup lang="ts">
import ActionBarBase from "@/components/ActionBar/ActionBarBase.vue";
import selectIconUrl from '/src/assets/img/selection-icon-individual.svg';
import allIconUrl from '/src/assets/img/selection-icon-all.svg';
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import { computed } from "vue";
import { UpdateFollowerTasksCallback } from "@/constants/_functionTypes";

const props = defineProps({
  shareType: {
    type: String,
    require: true,
    default: ''
  }
});

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();

const sendToAll = () => {
  //Set up the action store
  actionPinia.shareType = props.shareType;

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

  //Change the side menu highlight
  classroomPinia.view = "classroom";

  //Close the modal
  actionPinia.showModal = false;

  //Send to all users
  const updateFollowerTasksCallback: UpdateFollowerTasksCallback = (uniqueId, tasks, followerType) => {
    classroomPinia.updateFollowerTasks(uniqueId, tasks, followerType);
  };

  actionPinia.shareContent(updateFollowerTasksCallback);
}

const selectIndividuals = () => {
  //Close the modal
  actionPinia.showModal = false;

  //Change the side menu highlight
  classroomPinia.view = "classroom";

  //Set up the action bar
  actionPinia.selecting = true;
  actionPinia.shareType = props.shareType;
}

const shareText = computed(() => {
  switch(props.shareType) {
    case "website":
      return `Share link with`

    case "curated":
      if(actionPinia.selectedItems.length === 0) {
        return "No videos selected";
      } else {
        return `Share ${actionPinia.selectedItems.length} Video${actionPinia.selectedItems.length > 1 ? 's' : ''} with`
      }

      //Only Mobile users can be shared a local video
    case "video":
      return `Share ${actionPinia.selectedItems.length} Video${actionPinia.selectedItems.length > 1 ? 's' : ''} with`

      //Only Mobile users can be shared a local application
    case "app":
      if(actionPinia.selectedItems.length === 0) {
        return "No applications selected";
      } else if (actionPinia.selectedItems.length === 1) {
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
  <ActionBarBase class="h-12">
    <template v-slot:right>
      <div class="flex flex-row mr-8 items-center">
        <div class="text-white mr-2">
          {{shareText}}
        </div>

        <div :class="{
                'h-9 flex items-center pl-3 pr-4 rounded-3xl text-base text-white': true,
                'cursor-pointer bg-blue-400 hover:bg-blue-300': actionPinia.selectedItems.length > 0,
                'bg-blue-400 opacity-50': actionPinia.selectedItems.length === 0 }"
             v-on:click="selectIndividuals"
        >
          <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
          Select
        </div>

        <div :class="{
                'h-9 flex items-center ml-2 pl-3 pr-4 rounded-3xl text-base text-white': true,
                'cursor-pointer bg-blue-400 hover:bg-blue-300': actionPinia.selectedItems.length > 0,
                'bg-blue-400 opacity-50': actionPinia.selectedItems.length === 0 }"
             v-on:click="sendToAll"
        >
          <img class="w-5 h-5 mr-2" :src="allIconUrl" alt="Icon"/>
          All
        </div>
      </div>
    </template>
  </ActionBarBase>
</template>
