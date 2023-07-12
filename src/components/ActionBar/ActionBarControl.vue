<script setup lang="ts">
import ActionBarBase from "@/components/ActionBar/ActionBarBase.vue";
import selectIconUrl from '/src/assets/img/selection-icon-individual.svg';
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();

const shareContent = () => {
  actionPinia.showModal = true;
}

const clearTaskList = () => {
  actionPinia.selectedFollowers.forEach(follower => {
    follower.clearTasks();
    classroomPinia.updateFollowerTasks(follower.getUniqueId(), [], follower.type);
  });
}

const lockScreens = () => {
  console.log("LOCK USER");
}

const muteSound = () => {
  console.log("MUTE USER");
}

const removeUser = () => {
  console.log("REMOVE USER");
}

const selectAll = () => {
  console.log("SELECT ALL");
}

const cancel = () => {
  //Open the share content model
  actionPinia.selectedFollowers = [];
}
</script>

<template>
  <ActionBarBase>
    <template v-slot:left>
      <div class="flex flex-row [&>*]:mr-2">
        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
          v-on:click="shareContent"
        >
          <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
          Share Content
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="clearTaskList"
        >
          <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
          Clear Tasks
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="lockScreens"
        >
          <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
          Lock Screens
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="muteSound"
        >
          <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
          Mute Sound
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="removeUser"
        >
          <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
          Remove User<span v-if="actionPinia.selectedItems.length > 1">s</span>
        </div>
      </div>
    </template>

    <template v-slot:right>
      <div class="flex flex-row items-center">
        <div class="text-white mr-2">
          {{actionPinia.selectedFollowers.length}} Selected
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
        text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="selectAll"
        >
          Select All
        </div>

        <div class="h-9 flex items-center ml-2 pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-gray-400 hover:bg-gray-300"
          v-on:click="cancel"
        >
          Cancel
        </div>
      </div>
    </template>
  </ActionBarBase>
</template>
