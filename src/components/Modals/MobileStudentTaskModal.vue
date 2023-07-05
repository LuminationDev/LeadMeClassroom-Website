<script setup lang="ts">
import "../../styles.css";
import Modal from "./Modal.vue";
import * as REQUESTS from "../../constants/_requests";
import { computed, defineProps, ref } from "vue";
import type { PropType } from "vue";
import type MobileFollower from "../../models/Followers/_mobileFollower";
import HoverButton from "../Buttons/HoverButton.vue";
import Tooltip from "../Buttons/Tooltip.vue";
import type { Task } from "@/models";
import { useClassroomStore } from "@/stores/classroomStore";
const classroomPinia = useClassroomStore();

const props = defineProps({
  mobileFollower: {
    type: Object as PropType<MobileFollower>,
    required: true,
  },
});

const showModal = ref(false);
const showMedia = ref(false);

defineExpose({
  openModal
});

/**
 * A generic function that can be exposed to the another component.
 */
function openModal() {
  showModal.value = true

  if(props.mobileFollower.tasks.length > 0) {
    selectedTaskName.value = props.mobileFollower.tasks[0].getName();
  }

  if(props.mobileFollower.videos.length > 0) {
    selectedVideoName.value = props.mobileFollower.videos[0].getName();
  }
}

//Track the currently selected video
const selectedVideoName = ref("");

//Track the currently selected application
const selectedTaskName = ref(REQUESTS.MOBILE_PACKAGE);
const selectedTask = computed(() => {
  const packageName = props.mobileFollower.currentApplication;
  console.log(packageName);

  if (props.mobileFollower.tasks.length === 0) {
    selectedTaskName.value = "-1";
    return null;
  }

  let application = props.mobileFollower.tasks.find(res => res.getName() === selectedTaskName.value);

  if (application === undefined) {
    selectedTaskName.value = props.mobileFollower.tasks[0].getName();
    return props.mobileFollower.tasks[0];
  } else {
    return application;
  }
});

function removeFromTasks() {
  const task: Task|null = selectedTask.value;
  if(task === null) return;

  props.mobileFollower.tasks = props.mobileFollower.tasks.filter(entry => entry.getName() !== task.getName());
  const stringValues = props.mobileFollower.tasks.map(app => app.toStringEntry());
  classroomPinia.updateFollowerTasks(props.mobileFollower.getUniqueId(), stringValues, REQUESTS.MOBILE);
}

function changeActiveApplication(task: Task|null) {
  if (task === null) {
    return
  }
  const request = task.toRequest();

  if (request) {
    classroomPinia.requestActiveMedia(
        props.mobileFollower.getUniqueId(),
        request,
        REQUESTS.MOBILE
    );
  }
}

function pushSelectedVideo(video: String) {
  classroomPinia.requestActiveMedia(
      props.mobileFollower.getUniqueId(),
      {type: REQUESTS.FORCEACTIVEVIDEOLOCAL, action: video},
      REQUESTS.MOBILE
  );
}

function closeModal() {
  showModal.value = false;
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="w-full p-1">
    <span class="w-full h-full rounded-sm flex justify-center items-center hover:bg-white-menu-overlay"
         v-on:click="openModal()">
      <img class="w-6 h-6" src="/src/assets/img/student-icon-tasks.svg" alt="Icon"/>
    </span>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width-sm bg-white flex justify-between items-center rounded-t-lg">
          <div class="bg-white flex flex-col">
            <span class="text-lg font-medium text-black">{{showMedia ? 'Video' : 'Task'}} Management</span>
            <p class="mt-1 text-sm text-zinc-700">{{ mobileFollower.name }}</p>
          </div>
        </header>
      </template>

      <template v-slot:content>

        <!--Application control bar-->
        <div class="inline-block h-14 mt-3.5 mb-5 mx-5 flex flex-row justify-center items-center bg-white rounded-3xl shadow-md">
          <div v-if="!showMedia" class="flex flex-row h-5">

            <!--Application focus control-->
            <div class="has-tooltip mr-14">
              <Tooltip :tip="'Bring to front'" />

              <img v-if="selectedTaskName === '-1' || selectedTask === null || mobileFollower.tasks.length === 0" class="h-5" src="/src/assets/img/studentDetails/student-icon-focus-disabled.svg" alt="focus"/>
              <HoverButton v-else-if="selectedTask.getName() !== mobileFollower.tasks[0].getName()" class="h-5 w-5" @click="changeActiveApplication(selectedTask)">
                <template v-slot:original><img src="/src/assets/img/studentDetails/student-icon-focus.svg"  alt="focus"/></template>
                <template v-slot:hover><img src="/src/assets/img/studentDetails/student-icon-focus-hover.svg"  alt="focus"/></template>
              </HoverButton>
              <img v-else class="h-5" src="/src/assets/img/studentDetails/student-icon-focus-disabled.svg"  alt="focus"/>
            </div>

            <!--Return to home-->
            <div class="has-tooltip">
              <Tooltip :tip="'Remove task'" :toolTipMargin="'-ml-2'" :arrow-margin="'ml-0'" />

              <div v-if="selectedTaskName === '-1'" class="h-5 w-5 flex items-center">
                <img class="h-4" src="/src/assets/img/studentDetails/student-icon-close-tab-disabled.svg"  alt="focus"/>
              </div>

              <HoverButton v-else @click="removeFromTasks" class="h-5 w-5">
                <template v-slot:original><img class="h-4" src="/src/assets/img/studentDetails/student-icon-close-tab.svg"  alt="close"/></template>
                <template v-slot:hover><img class="h-4" src="/src/assets/img/studentDetails/student-icon-close-tab-hover.svg"  alt="close"/></template>
              </HoverButton>
            </div>
          </div>

          <div v-else class="flex flex-row h-5">
            <!--Push video file button-->
            <div class="has-tooltip mr-14">
              <Tooltip :tip="'Push video file'" />

              <img v-if="selectedVideoName === '-1' || mobileFollower.videos.length === 0" class="h-5" src="/src/assets/img/studentDetails/student-icon-focus-disabled.svg" alt="focus"/>
              <HoverButton v-else-if="selectedVideoName !== ''" class="h-5 w-5" @click="pushSelectedVideo(selectedVideoName)">
                <template v-slot:original><img src="/src/assets/img/studentDetails/student-icon-focus.svg"  alt="focus"/></template>
                <template v-slot:hover><img src="/src/assets/img/studentDetails/student-icon-focus-hover.svg"  alt="focus"/></template>
              </HoverButton>
              <img v-else class="h-5" src="/src/assets/img/studentDetails/student-icon-focus-disabled.svg"  alt="focus"/>
            </div>
          </div>
        </div>

        <!--Video list-->
        <div v-if="showMedia" class="w-modal-width-sm h-96 flex flex-col overflow-y-auto">
          <!--The assistant page is present but not counted-->
          <div v-if="mobileFollower.videos.length === 0" class="py-1 flex flex-row w-full px-5 items-center justify-between">
            <div class="w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap">
              <img class="flex-shrink-0 w-5 h-5 mr-2" src="/src/assets/img/icon-128.png"  alt=""/>
              <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">No videos found...</span>
            </div>
          </div>

          <div v-for="(video, index) in mobileFollower.videos" :key="index" class="py-1" :id="video.getName()">

            <!--Individual applications-->
            <div class="flex flex-row w-full px-5 items-center justify-between">
              <div :class="{
                  'w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap': true,
                  'overflow-hidden rounded-lg cursor-pointer': true,
                  'hover:bg-opacity-50 hover:bg-gray-300': selectedVideoName !== video.getName(),
                  'bg-white': selectedVideoName === video.getName(),
                  }"
                   @click="selectedVideoName = video.getName()"
              >

                <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" src="" alt=""/>
                <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ video.getName() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!--Application list-->
        <div v-else class="w-modal-width-sm h-96 flex flex-col overflow-y-auto">
          <!--The assistant page is present but not counted-->
          <div v-if="mobileFollower.tasks.length === 0" class="py-1 flex flex-row w-full px-5 items-center justify-between">
            <div class="w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap">
              <img class="flex-shrink-0 w-5 h-5 mr-2" src="/src/assets/img/icon-128.png"  alt=""/>
              <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">No assigned tasks...</span>
            </div>
          </div>

          <transition-group v-else name="list-complete" tag="div">
            <div v-for="(task, index) in mobileFollower.tasks" v-bind:key="index" class="py-1" :id="task.getName()">

              <!--Individual applications-->
              <div class="flex flex-row w-full px-5 items-center justify-between">
                <div :class="{
                    'w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap': true,
                    'overflow-hidden rounded-lg cursor-pointer': true,
                    'hover:bg-opacity-50 hover:bg-gray-300': selectedTask?.getName() !== task.getName(),
                    'bg-white': selectedTask?.getName() === task.getName(),
                    }"
                    @click="selectedTaskName = task.getName()"
                >
                  <!--TODO work out how to get the icon when they are in the storage bucket-->
                  <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" src="" alt=""/>
                  <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ task.getName() }}</span>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="w-modal-width-sm">
          <div class="h-12 bg-navy-side-menu rounded-b-sm flex">
            <button class="w-full p-1 flex justify-center">
              <span class="w-1/2 h-full rounded-sm flex justify-center items-center hover:bg-white-menu-overlay"
                  v-on:click="showMedia = !showMedia">
                <img v-if="showMedia" class="w-7 h-7" src="/src/assets/img/student-icon-tasks.svg" alt="Icon"/>
                <img v-else class="w-8 h-8" src="/src/assets/img/media-video.svg" alt="Icon"/>
              </span>
            </button>

            <div class="h-10 mt-1 w-px bg-white"></div>

            <button class="w-full py-1 flex justify-center">
              <span class="w-1/2 h-full rounded-sm flex justify-center items-center hover:bg-white-menu-overlay"
                   v-on:click="showModal = false">
                <img class="w-5 h-3" src="/src/assets/img/minimize.svg" alt="Icon"/>
              </span>
            </button>
          </div>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>
