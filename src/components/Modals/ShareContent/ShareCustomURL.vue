<script setup lang="ts">
import { ref, nextTick } from "vue";
import { helpers, required } from "@vuelidate/validators";
import { useActionStore } from "@/stores/actionStore";
import useVuelidate from "@vuelidate/core";
import devicesIconUrl from '/src/assets/img/share-content-devices.svg';
import selectIconUrl from '/src/assets/img/selection-icon-individual.svg';
import allIconUrl from '/src/assets/img/selection-icon-all.svg';
import LinkIcon from "@/assets/vue/Content/LinkIcon.vue";
import type { UpdateFollowerTasksCallback } from "@/constants/_functionTypes";
import { useClassroomStore } from "@/stores/classroomStore";

const emit = defineEmits<{
  (e: 'close'): void
}>()

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();

const websiteLink = ref("");
const inputFocus = ref(false);
const urlInput = ref<HTMLInputElement | null>(null)

const rules = {
  websiteLink: {
    required: helpers.withMessage("Website link is required", required)
  }
}

const v$ = useVuelidate(rules, { websiteLink });

async function validate(): Promise<boolean> {
  return await v$.value.$validate();
}

const showURLInput = () => {
  inputFocus.value = true
  nextTick(() => {
    urlInput.value!.focus();
  });
}

const selectIndividuals = async () => {
  if(!await validate()) {
    return;
  }

  actionPinia.websiteURL = websiteLink.value;

  //Close the modal
  emit('close');

  //Set up the action bar
  actionPinia.selecting = true;
  actionPinia.shareType = 'website';
}

const selectAll = () => {
  //Set up the action store
  actionPinia.shareType = 'website';

  //Select all users
  classroomPinia.mobileFollowers.forEach(follower => {
    actionPinia.handleFollowerSelection(follower, true);
  });

  classroomPinia.webFollowers.forEach(follower => {
    actionPinia.handleFollowerSelection(follower, true);
  });

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
</script>

<template>
  <!--URL 'button' that switches to the input-->
  <div v-if="!inputFocus && websiteLink.length === 0"
    class="flex justify-between items-center
      text-gray-400 text-lg hover:bg-slate-100
      bg-white rounded-2xl p-1 h-16 cursor-pointer"
    v-on:click="showURLInput">

    <!--Placeholder to keep the url text centered-->
    <div class="w-5 h-5 ml-5"></div>

    <div class="flex justify-center items-center">
      <LinkIcon class="w-5 h-5 mr-3" :colour="'#959EAF'" />
      Share a Custom URL
    </div>

    <img class="w-5 h-5 mr-5" :src="devicesIconUrl" alt="Icon"/>
  </div>

  <!--URL input area with selection buttons-->
  <div v-else class="flex justify-between items-center
     text-lg bg-white rounded-2xl p-1 h-16">

    <LinkIcon class="w-5 h-5 ml-8" :colour="inputFocus ? '#3B82F6' : 'black'" />

    <input
      ref="urlInput"
      class="h-11 ml-2 mr-6 flex-grow border-0 outline-0 bg-white text-base text-black rounded-lg"
      type="text"
      placeholder="Paste a URL..."
      v-model="v$.websiteLink.$model"
      @focusin="inputFocus = true"
      @focusout="inputFocus = false"
    />

    <div class="flex flex-row mr-8">
      <div :class="{
        'h-9 flex items-center pl-3 pr-4 rounded-3xl text-base text-white': true,
        'cursor-pointer bg-blue-400 hover:bg-blue-300': websiteLink.length > 0,
        'bg-blue-200': websiteLink.length === 0 }"
         v-on:click="selectIndividuals"
      >
        <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
        Select
      </div>

      <div :class="{
        'h-9 flex items-center ml-2 pl-3 pr-4 rounded-3xl text-base text-white': true,
        'cursor-pointer bg-blue-400 hover:bg-blue-300': websiteLink.length > 0,
        'bg-blue-200': websiteLink.length === 0 }"
         v-on:click="selectAll"
      >
        <img class="w-5 h-5 mr-2" :src="allIconUrl" alt="Icon"/>
        All
      </div>
    </div>
  </div>
</template>
