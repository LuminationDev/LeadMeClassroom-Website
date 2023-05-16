<script setup lang="ts">
import { computed, Ref, ref } from "vue";
import MobileGridItem from "../Dashboard/ClassControl/GridItem/Mobile/MobileGridItem.vue";
import Modal from "./Modal.vue";
import * as REQUESTS from "../../constants/_requests";
import { MobileFollower, Task, Application } from "../../models";
import GenericButton from "../Buttons/GenericButton.vue";
import { useDashboardStore } from "@/stores/dashboardStore";

const dashboardPinia = useDashboardStore();
const showModal = ref(false);
const shareType = ref("single");
const shareTo = ref("all");
const followersSelected: Ref<string[]> = ref([]);
const submissionAttempted = ref(false);

defineExpose({
  openModal
});

const sortedFollowers = computed((): Array<MobileFollower> => {
  return dashboardPinia.mobileFollowers.sort((a: MobileFollower, b: MobileFollower) => {
    return a.name.localeCompare(b.name)
  });
});

//Track the currently selected application
const selectedApplications: Ref<Task[]> = ref([])
const addOrRemoveApplication = (application: Application) => {
  const index = selectedApplications.value.findIndex(app => app.getPackageName() === application.packageName);

  if (index > -1) {
    selectedApplications.value.splice(index, 1);
  } else {
    selectedApplications.value.push(new Task(application.name, application.packageName, "Application"));
  }
}

const selectedApplicationId = ref("");
const selectedApplication = computed(() => {
  let apps = dashboardPinia.collectUniqueApplications();
  if(apps === undefined) {
    return null;
  }

  if (apps?.length === 0) {
    selectedApplicationId.value = "-1";
    return null;
  }

  return apps?.find(res => res.id === selectedApplicationId.value);
});

async function validateAndSubmit() {
  submissionAttempted.value = true
  if (shareTo.value === "selected" && followersSelected.value.length === 0) {
    return;
  }

  submit();
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

function submit() {
  shareType.value === 'single' ? singleApp() : multiApp();
  closeModal();
}

/**
 * Launch a single application to either the selected followers or to all connected users.
 */
function singleApp() {
  if (shareTo.value === 'all') {
    dashboardPinia.requestAction({type: REQUESTS.FORCEACTIVEAPP, action: selectedApplicationId.value}, REQUESTS.MOBILE);
  }
  else if (shareTo.value === 'selected') {
    followersSelected.value.forEach(id => {
      dashboardPinia.requestIndividualAction(id, {type: REQUESTS.FORCEACTIVEAPP, action: selectedApplicationId.value}, REQUESTS.MOBILE)
    });
  }
}

/**
 * Send multiple applications to either the selected followers or to all connected users. This will update the
 * tasks array in firebase for each of the associated followers.
 */
function multiApp() {
  sortedFollowers.value.forEach(follower => {
    if (shareTo.value === 'all' || followersSelected.value.includes(follower.getUniqueId())) {
      follower.tasks = Array.from(new Set(follower.tasks.concat(selectedApplications.value)));
      dashboardPinia.updateFollowerTasks(follower.getUniqueId(), follower.tasks.map(app => app.toStringEntry()), REQUESTS.MOBILE);
    }
  });
}

function openModal() {
  showModal.value = true;
}

function closeModal() {
  showModal.value = false
  submissionAttempted.value = false
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="
    w-56 h-9 flex justify-center items-center
    bg-blue-500 hover:bg-blue-400
    text-white text-base font-medium"
    v-on:click="showModal = true"
    id="share_button"
  >
    <img class="w-4 h-4 mr-3" src="/src/assets/img/session-icon-share.svg" alt="Icon"/>
      Share application
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width bg-white flex justify-between items-center rounded-t-lg">
          <p class="text-2xl font-medium">Share an application with your class</p>

          <img
              v-on:click="closeModal"
              class="w-4 h-4 cursor-pointer"
              src="/src/assets/img/modal-icon-exit.svg"
              alt="Close Icon"
          />
        </header>
      </template>

      <template v-slot:content>
        <div class="w-modal-width">
          <div class="h-96 flex flex-col overflow-y-auto">
            <div v-for="(application) in dashboardPinia.collectUniqueApplications()" v-bind:key="application" class="py-1" :id="application.id">

              <!--Individual applications-->
              <div v-if="shareType === 'single'" class="flex flex-row w-full px-5 items-center justify-between">
                <div :class="{
                      'w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap': true,
                      'overflow-hidden rounded-lg cursor-pointer': true,
                      'hover:bg-opacity-50 hover:bg-gray-300': selectedApplication?.id !== application.id,
                      'bg-white': selectedApplication?.id === application.id,
                      }"
                     @click="selectedApplicationId = application.id"
                >
                  <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" :src="dashboardPinia.firebase.getAppIcon(application.packageName)" alt=""/>
                  <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ application.getName() }}</span>
                </div>
              </div>

              <!--Multiple applications-->
              <div v-else-if="shareType === 'multi'" class="flex flex-row w-full px-5 items-center justify-between">
                <div :class="{
                      'w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap': true,
                      'overflow-hidden rounded-lg cursor-pointer': true,
                      'hover:bg-opacity-50 hover:bg-gray-300': selectedApplications.findIndex(app => app.getPackageName() === application.id) === -1,
                      'bg-white': selectedApplications.findIndex(app => app.getPackageName() === application.id) !== -1,
                      }"
                     @click="addOrRemoveApplication(application)"
                >
                  <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" :src="application.getIcon()" alt=""/>
                  <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ application.getName() }}</span>
                </div>
              </div>

            </div>
          </div>

          <div class="mx-14 mt-8 h-20 bg-white flex items-center justify-between">
            <p class="ml-8 text-lg font-medium mr-2">Share to</p>
            <div class="flex justify-start">
              <label class="mr-4 lg:mr-14 flex justify-between items-center">
                <input class="h-5 w-5 mr-4" name="shareType" type="radio" v-model="shareType" value="single">
                <span class="text-base">Single application</span>
              </label>

              <label class="flex justify-between items-center mr-8 lg:mr-20">
                <input class="h-5 w-5 mr-4" name="shareType" type="radio" v-model="shareType" value="multi">
                <span class="text-base">Multiple applications</span>
              </label>
            </div>

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
        <div class="w-modal-width max-h-64 overflow-y-auto">
          <div v-if="shareTo === 'selected' && dashboardPinia.mobileFollowers.length"
               class="mt-4 flex flex-row flex-wrap ml-10 mr-14">
            <MobileGridItem
                v-for="follower in sortedFollowers"
                :key="follower.getUniqueId()"
                class="pl-4 pt-4 w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
                :mobileFollower="follower"
                :controls="false"
                @update="(value: boolean) => { handleFollowerSelection(follower.getUniqueId(), value) }"/>
          </div>
          <div class="flex justify-center items-center bg-gray-200 mx-14 mt-4 px-5 py-5" v-else-if="shareTo === 'selected'">
            <span>No students connected</span>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="mt-11 mb-8 mr-14 text-right flex flex-row justify-end">
          <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default font-medium"
                  v-on:click="showModal = false"
          >Cancel</button>
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
                :callback="validateAndSubmit"
            >Share application</GenericButton>
          </div>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>
