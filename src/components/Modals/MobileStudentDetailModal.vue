<script setup lang="ts">
import "../../styles.css";
import Modal from "./Modal.vue";
import * as REQUESTS from "../../constants/_requests";
import { computed, ref } from "vue";
import type { PropType } from "vue";
import type MobileFollower from "../../models/Followers/_mobileFollower";
import HoverButton from "../Buttons/HoverButton.vue";
import Tooltip from "../Buttons/Tooltip.vue";
import type {Application} from "@/models";
import { useClassroomStore } from "@/stores/classroomStore";
const classroomPinia = useClassroomStore();

defineEmits<{
  (e: 'taskManager'): void
}>()

const props = defineProps({
  mobileFollower: {
    type: Object as PropType<MobileFollower>,
    required: true,
  },
});

const showModal = ref(false);

defineExpose({
  openModal
});

/**
 * A generic function that can be exposed to the another component.
 */
function openModal() {
  showModal.value = true

  if(props.mobileFollower.applications.length > 0) {
    selectedApplicationId.value = props.mobileFollower.currentApplication;
  }
}

//Track the currently selected application
const selectedApplicationId = ref(REQUESTS.MOBILE_PACKAGE);
const selectedApplication = computed(() => {
  const packageName = props.mobileFollower.currentApplication;
  console.log(packageName);

  if (props.mobileFollower.applications.length === 0) {
    selectedApplicationId.value = "-1";
    return null;
  }

  let application = props.mobileFollower.applications.find(res => res.id === selectedApplicationId.value);

  if (application === undefined) {
    selectedApplicationId.value = props.mobileFollower.applications[0].id;
    return props.mobileFollower.applications[0];
  } else {
    return application;
  }
});

const muteTooltip = computed(() => {
  if(selectedApplication.value === null || selectedApplication.value === undefined) { return "Mute"; }

  return selectedApplication.value.muted ? 'Unmute' : 'Mute'
});

function returnFollowerApplication() {
  //Reset the selected value
  selectedApplicationId.value = REQUESTS.MOBILE_PACKAGE;

  classroomPinia.requestActiveMedia(
      props.mobileFollower.getUniqueId(),
      { type: REQUESTS.FORCEACTIVEAPP, action: REQUESTS.MOBILE_PACKAGE },
      REQUESTS.MOBILE
  );
}

function muteOrUnmuteFollower(mute: boolean) {
  console.log('heard a mute/unmute request', mute)
  props.mobileFollower.muted = mute;

  const action = { type: REQUESTS.DEVICEAUDIO, action: mute ? REQUESTS.MUTE : REQUESTS.UNMUTE }
  classroomPinia.requestIndividualAction(props.mobileFollower.getUniqueId(), action, REQUESTS.MOBILE)
}

function changeActiveApplication(application: Application|null) {
  if (application === null) {
    return
  }
  classroomPinia.requestActiveMedia(
      props.mobileFollower.getUniqueId(),
      { type: REQUESTS.FORCEACTIVEAPP, action: application.getPackageName() },
      REQUESTS.MOBILE
  );
}

function closeModal() {
  showModal.value = false;
}

/**
 * Check if the lastActivated website is within the tasks array. The task array is populated when a teacher pushes
 * out a website.
 * @param packageName A string representing the package name of the currently active application for a follower.
 */
const checkMedia = (packageName: string) => {
  let tasks = classroomPinia.mobileTasks;
  if(tasks.length === 0) { return; }

  return !tasks.some((res) => (packageName.includes(res.toString())));
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="w-full p-1">
    <span class="w-full h-full rounded-sm flex justify-center items-center hover:bg-white-menu-overlay"
         v-on:click="openModal()">
      <img class="w-6 h-6" src="/src/assets/img/student-icon-ham-menu.svg" alt="Icon"/>
    </span>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width-sm bg-white flex justify-between items-center rounded-t-lg">
          <div class="bg-white flex flex-col">
            <span class="text-lg font-medium text-black">Application Control</span>
            <p class="mt-1 text-sm text-zinc-700">{{ mobileFollower.name }}</p>
          </div>
        </header>
      </template>

      <template v-slot:content>

        <!--Application control bar-->
        <div class="inline-block h-14 mt-3.5 mb-5 mx-5 flex flex-row justify-center items-center bg-white rounded-3xl shadow-md">
          <div class="flex flex-row h-5">

            <!--Audio control-->
            <div class="has-tooltip">
              <Tooltip :tip="muteTooltip" />

              <!--TODO this is not fully setup for mobile yet-->
<!--              <img v-if="selectedApplication === null" class="h-5 w-5 mr-2" src="/src/assets/img/studentDetails/student-icon-audible-disabled.svg" alt=""/>-->
<!--              <div v-else-if="selectedApplication.muting" class="lds-dual-ring h-5 w-7 mr-2" />-->
              <HoverButton class="h-5 w-7" @click="muteOrUnmuteFollower(!mobileFollower.muted)">
                <template v-slot:original>
                  <img v-if="mobileFollower.muted" src="/src/assets/img/studentDetails/student-icon-muted.svg" alt=""/>
                  <img v-else class="h-5 w-5" src="/src/assets/img/studentDetails/student-icon-audible.svg"  alt=""/>
                </template>
                <template v-slot:hover>
                  <img v-if="mobileFollower.muted" src="/src/assets/img/studentDetails/student-icon-muted-hover.svg" alt=""/>
                  <img v-else class="h-5 w-5" src="/src/assets/img/studentDetails/student-icon-audible-hover.svg"  alt=""/>
                </template>
              </HoverButton>
<!--              <img v-else class="h-5 w-5 mr-2" src="/src/assets/img/studentDetails/student-icon-audible-disabled.svg" alt=""/>-->
            </div>

            <!--Application focus control-->
            <div class="has-tooltip mx-14">
              <Tooltip :tip="'Bring to front'" />

              <img v-if="selectedApplicationId === '-1'" class="h-5" src="/src/assets/img/studentDetails/student-icon-focus-disabled.svg" alt="focus"/>
              <HoverButton v-else-if="selectedApplication && selectedApplication.id !== mobileFollower.applications[0].id" class="h-5 w-5" @click="changeActiveApplication(selectedApplication)">
                <template v-slot:original><img src="/src/assets/img/studentDetails/student-icon-focus.svg"  alt="focus"/></template>
                <template v-slot:hover><img src="/src/assets/img/studentDetails/student-icon-focus-hover.svg"  alt="focus"/></template>
              </HoverButton>
              <img v-else class="h-5" src="/src/assets/img/studentDetails/student-icon-focus-disabled.svg"  alt="focus"/>
            </div>

            <!--Return to home-->
            <div class="has-tooltip">
              <Tooltip :tip="'Close tab'" :toolTipMargin="'-ml-2'" :arrow-margin="'ml-0'" />

              <div v-if="selectedApplicationId === '-1'" class="h-5 w-5 flex items-center">
                <img class="h-4" src="/src/assets/img/studentDetails/student-icon-close-tab-disabled.svg"  alt="focus"/>
              </div>

              <HoverButton v-else @click="returnFollowerApplication()" class="h-5 w-5">
                <template v-slot:original><img class="h-4" src="/src/assets/img/studentDetails/student-icon-close-tab.svg"  alt="close"/></template>
                <template v-slot:hover><img class="h-4" src="/src/assets/img/studentDetails/student-icon-close-tab-hover.svg"  alt="close"/></template>
              </HoverButton>
            </div>

          </div>
        </div>

        <!--Application list-->
        <div class="w-modal-width-sm h-96 flex flex-col overflow-y-auto">
          <!--The assistant page is present but not counted-->
          <div v-if="mobileFollower.applications.length === 0" class="py-1 flex flex-row w-full px-5 items-center justify-between">
            <div class="w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap">
              <img class="flex-shrink-0 w-5 h-5 mr-2" src="/src/assets/img/icon-128.png"  alt=""/>
              <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">No applications...</span>
            </div>
          </div>

          <transition-group v-else name="list-complete" tag="div">
            <div v-for="(application, index) in mobileFollower.applications" :key="index" class="py-1" :id="application.id">

              <!--Individual applications-->
              <div class="flex flex-row w-full px-5 items-center justify-between">
                <div :class="{
                    'w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap': true,
                    'overflow-hidden rounded-lg cursor-pointer': true,
                    'hover:bg-opacity-50 hover:bg-gray-300': selectedApplication?.id !== application.id,
                    'bg-white': selectedApplication?.id === application.id,
                    }"
                    @click="selectedApplicationId = application.id"
                >
                  <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" :src="classroomPinia.firebase.getAppIcon(application.packageName) ?? undefined" alt=""/>
                  <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ application.getName() }}</span>

                  <!--Audible icons-->
                  <div class="flex flex-shrink-0 flex-[1_1_auto] justify-end">
                    <div class="h-4 mr-4 flex flex-row justify-center">
                      <Transition name="icon">
                        <div v-if="application.audible" class="pulse-icon">
                          <div v-if="application.muting" class="lds-dual-ring" />
                          <img v-else-if="application.muted" src="/src/assets/img/studentDetails/student-icon-sound-disabled.svg"  alt=""/>
                          <img v-else src="/src/assets/img/studentDetails/student-icon-sound.svg"  alt=""/>
                        </div>
                      </Transition>
                    </div>
                  </div>

                  <!--Alert for off task-->
                  <Transition name="icon">
                    <div v-if="checkMedia(application.id)" class="has-tooltip">
                      <Tooltip :tip="'Not in task list'" :toolTipMargin="'-ml-1'" :arrow-margin="'ml-1'" />
                      <img
                          class="w-6 h-6 mr-2 cursor-pointer"
                          src="/src/assets/img/student-icon-alert.svg"
                          alt="alert icon"
                      />
                    </div>
                  </Transition>
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
                    v-on:click="$emit('taskManager'); showModal = false">
                <img class="w-9 h-5" src="/src/assets/img/student-icon-tasks.svg" alt="Icon"/>
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
