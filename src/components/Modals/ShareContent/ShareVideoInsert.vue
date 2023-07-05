<script setup lang="ts">
import { computed, ref } from "vue";
import type { Ref } from "vue";
import useVuelidate from "@vuelidate/core";
import { helpers, required } from "@vuelidate/validators";
import MobileGridItem from "../../Classroom/ClassControl/GridItem/Mobile/MobileGridItem.vue";
import type { MobileFollower } from "../../../models";
import GenericButton from "../../Buttons/GenericButton.vue";
import { useClassroomStore } from "@/stores/classroomStore";
import * as REQUESTS from "@/constants/_requests";
import {Task} from "@/models";
import {storeToRefs} from "pinia";

const classroomPinia = useClassroomStore();
const {  mobileFollowers } = storeToRefs(classroomPinia)
const showModal = ref(false);
const videoLink = ref("");
const shareTo = ref("all");
const followersSelected: Ref<string[]> = ref([]);
const submissionAttempted = ref(false);

defineEmits<{
  (e: 'back'): void
}>()

defineExpose({
  openModal
});

const sortedMobileFollowers = computed((): Array<MobileFollower> => {
  return mobileFollowers.value.slice().sort((a: MobileFollower, b: MobileFollower) => {
    return a.name.localeCompare(b.name)
  });
});

const rules = {
  websiteLink: {
    required: helpers.withMessage("Video link is required", required)
  }
}

const v$ = useVuelidate(rules, { websiteLink: videoLink })

async function validate(): Promise<boolean> {
  submissionAttempted.value = true
  if (shareTo.value === "selected" && followersSelected.value.length === 0) {
    return false;
  }

  return await v$.value.$validate();
}

function handleFollowerSelection(UUID: string, value: boolean) {
  let index = followersSelected.value.findIndex(element => element === UUID)
  if (value) {
    if (index === -1) {
      followersSelected.value.splice(0, 0, UUID)
    }
  } else {
    if (index !== -1) {
      followersSelected.value.splice(index, 1)
    }
  }
}

async function submit() {
  if(!await validate()) {
    return;
  }

  const request = { type: REQUESTS.FORCEACTIVEVIDEOLINK, action: videoLink.value };

  if (shareTo.value === 'all') {
    classroomPinia.requestAction(request, REQUESTS.MOBILE);
  } else if (shareTo.value === 'selected') {
    followersSelected.value.forEach(id => {
      classroomPinia.requestIndividualAction(id, request, REQUESTS.MOBILE);
    });
  }

  closeModal();
}

async function submitNewTask() {
  if(!await validate()) {
    return;
  }

  let task: Task = new Task("VR Video", videoLink.value, "Video");

  const followersToProcess = shareTo.value === 'all' ? sortedMobileFollowers.value :
      sortedMobileFollowers.value.filter(f => followersSelected.value.includes(f.getUniqueId()));

  followersToProcess.forEach(follower => {
    follower.tasks.push(task);
    const stringValues = follower.tasks.map(app => app.toStringEntry());
    classroomPinia.updateFollowerTasks(follower.getUniqueId(), stringValues, REQUESTS.MOBILE);
  });
}

function clearTaskList() {
  const followers = shareTo.value === 'selected'
      ? sortedMobileFollowers.value.filter(follower => followersSelected.value.includes(follower.getUniqueId()))
      : sortedMobileFollowers.value;

  followers.forEach(follower => {
    follower.clearTasks();
    classroomPinia.updateFollowerTasks(follower.getUniqueId(), [], REQUESTS.MOBILE);
  });
}

function openModal() {
  showModal.value = true;
}

function closeModal() {
  v$.value.$reset();
  showModal.value = false
  submissionAttempted.value = false
}
</script>

<template>
  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <div class="w-modal-width-sm">
    <div class="mx-14 mt-8 py-6 bg-white flex flex-col">
      <div class="flex items-center justify-between">
        <input
            class="h-11 ml-6 mr-6 px-4 flex-grow bg-panel-background text-base rounded-lg"
            type="text"
            placeholder="Paste a URL..."
            v-model="v$.websiteLink.$model"
        />
      </div>
      <div class="mt-1 ml-6" v-if="v$.websiteLink && v$.websiteLink.$error">
        <span class="text-red-800" :key="error.$uid" v-for="error in v$.websiteLink.$errors">{{ error.$message }}</span>
      </div>
    </div>
    <div class="mx-14 mt-8 h-20 bg-white flex items-center justify-between">
      <p class="ml-8 text-lg font-medium mr-2">Share to</p>
      <div class="flex justify-start">
        <label class="mr-4 lg:mr-14 flex justify-between items-center">
          <input class="h-5 w-5 mr-4" name="shareTo" type="radio" v-model="shareTo" value="all">
          <span class="text-base">All connected users</span>
        </label>

        <label class="flex justify-between items-center mr-8 lg:mr-20">
          <input class="h-5 w-5 mr-4" name="shareTo" type="radio" v-model="shareTo" value="selected">
          <span class="text-base">Select users</span>
        </label>
      </div>
    </div>
  </div>

  <div class="w-modal-width-sm max-h-64 overflow-y-auto">
    <!--Mobile followers-->
    <div v-if="shareTo === 'selected' && mobileFollowers.length"
         class="mt-4 flex flex-row flex-wrap ml-10 mr-14">
      <MobileGridItem
          v-for="follower in sortedMobileFollowers"
          :key="follower.getUniqueId()"
          class="pl-4 pt-4 w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
          :mobileFollower="follower"
          :controls="false"
          @update="(value: boolean) => { handleFollowerSelection(follower.getUniqueId(), value) }"/>
    </div>

    <!--No followers-->
    <div v-else-if="shareTo === 'selected'" class="flex justify-center items-center bg-gray-200 mx-14 mt-4 px-5 py-5">
      <span>No students connected</span>
    </div>
  </div>

  <footer class="mt-11 mb-8 mx-14 text-right flex flex-row justify-between">
    <div class="flex flex-row">
      <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default font-medium"
              v-on:click="clearTaskList"
      >Clear tasks</button>

      <GenericButton
          class="w-52 h-12 text-white bg-blue-500 rounded-lg text-base hover:bg-blue-400 font-medium"
          :callback="submitNewTask"
      >Add to tasks</GenericButton>
    </div>

    <div class="flex flex-row">
      <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default font-medium"
              v-on:click="$emit('back');"
      >Back</button>
      <div class="relative">
        <div
            v-if="submissionAttempted && shareTo === 'selected' && followersSelected.length === 0"
            class="absolute bottom-12 min-w-max right-0 rounded shadow-lg
            px-3 py-1 rounded-xl bg-white text-black border-gray-600
            border-1 flex flex-row items-center mb-2">
          <img
              class="w-5 h-5 mr-2"
              src="/src/assets/img/student-icon-alert.svg"
              alt="alert icon"
          />
          <span>Please select a user to share this link to</span>
          <div class="absolute bottom-0 right-0 border-b-white h-0 w-0 rotate-180 border-x-8 border-x-transparent border-b-[1rem] -mb-2 mr-10"></div>
        </div>

        <GenericButton
            class="w-52 h-12 text-white bg-blue-500 rounded-lg text-base hover:bg-blue-400 font-medium"
            :callback="submit"
        >Share video</GenericButton>
      </div>
    </div>
  </footer>
</template>
