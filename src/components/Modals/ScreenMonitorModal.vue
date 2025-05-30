<script setup lang="ts">
import { ref } from "vue";
import type {PropType} from "vue";
import Modal from "./Modal.vue";
import * as REQUESTS from "../../constants/_requests";
import {useClassroomStore} from "@/stores/classroomStore";
import { useWebRTCStore } from "@/stores/webRTCStore";
import Tooltip from "../Buttons/Tooltip.vue";
import type { Follower } from "@/models";

const emit = defineEmits<{
  (e: 'studentDetail'): void
}>()

const classroomPinia = useClassroomStore();
const webRTCPinia = useWebRTCStore();

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  }
});

const showModal = ref(false);

defineExpose({
  initiateMonitoring
});

/**
 * Open the modal, sending a message to the follower to start sending screen captures.
 */
function initiateMonitoring() {
  showModal.value = true
  classroomPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORSTARTED }, REQUESTS.WEB);
}

/**
 * Start or stop a monitoring session
 */
function handleMonitorFollowerButton() {
  if (props.follower.monitoring) {
    console.log("Sending webRTC permission message to firebase");
    props.follower.monitoring = false;
    props.follower.permission = null;
    classroomPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORENDED }, REQUESTS.WEB);
  } else {
    props.follower.monitoring = true;
    webRTCPinia.stopTracks(props.follower.getUniqueId()); //stop video call if exists
    classroomPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORPERMISSION }, REQUESTS.WEB);
  }
}

/**
 * Stop any active monitoring session if the teacher clicks the close or cancel button, resetting a follower's
 * monitoring field.
 */
function cancelMonitor() {
  props.follower.monitoring = false;
  props.follower.permission = null;
  classroomPinia.requestIndividualAction(props.follower.getUniqueId(), { type: REQUESTS.MONITORENDED }, REQUESTS.WEB);
}

/**
 * Stop any current session and close the modal
 */
function closeModal() {
  cancelMonitor();
  showModal.value = false
  props.follower.collectingScreenshotFailed = false
  props.follower.imageBase64 = null
}

/**
 * Re-open the student details modal.
 */
function reopenDetails() {
  emit('studentDetail');
  closeModal();
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="w-full p-1">
    <span class="w-full h-full rounded-sm flex justify-center items-center hover:bg-white-menu-overlay"
         v-on:click="initiateMonitoring()">
      <img class="w-9 h-5" src="/src/assets/img/student-icon-eye.svg" alt="Icon"/>
    </span>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 bg-white flex justify-between items-center rounded-t-lg">
          <div class="bg-white flex flex-col">
            <span class="text-lg font-semibold text-black">Screen Monitoring</span>
            <p class="mt-1 text-sm text-zinc-700">{{ follower.name }}</p>
          </div>

          <img
              v-on:click="reopenDetails"
              class="w-4 h-4 cursor-pointer"
              src="/src/assets/img/options-back.svg"
              alt="Close Icon"
          />
        </header>
      </template>

      <template v-slot:content>
        <div class="w-auto inline-block max-h-monitor-modal w-full mt-7 px-9">
          <!--Screenshot content-->
          <div v-if="!follower.monitoring" class="w-full">
            <div v-if="!follower.imageBase64 && !follower.collectingScreenshotFailed" class="flex flex-col items-center">
              <p class="mt-20 lds-dual-ring-lg" />
              <p class="mb-6 mt-8 text-sm ">Collecting current screenshot...</p>
            </div>
            <div v-else-if="follower.collectingScreenshotFailed" class="flex flex-col items-center text-center">
              <img class="mt-20 w-32 xs:w-48" src="/src/assets/img/shocked_col.png" alt="Computer Icon"/>
              <p class="mb-6 mt-8 text-sm font-semibold">Screenshot could not be collected. This normally happens if the student is on a new empty tab. Try requesting live screen share.</p>
            </div>

            <img v-else class="aspect-video" :id="`image_${follower.getUniqueId()}`" :src="follower.imageBase64 ?? undefined" alt="Follower Screen shot"/>
          </div>

          <!--Monitoring and permission content-->
          <div v-else>
            <!--Waiting for permission-->
            <div v-if="follower.permission !== 'granted'"
                 :class="{
                    'w-modal-width-xsm aspect-video bg-white flex flex-col justify-center items-center' : 'true',
                    'hidden': follower.permission === 'granted'
            }">

              <div v-if="follower.permission === null" class="flex flex-col items-center">
                <img class="mt-20 w-32 xs:w-48" src="/src/assets/img/happy_col.png" alt="Computer Icon"/>
                <p class="mb-6 mt-8 text-sm">Waiting for student permission...</p>
              </div>

              <div v-if="follower.permission === 'connecting'" class="flex flex-col items-center">
                <p class="mt-20 lds-dual-ring-lg" />
                <p class="mb-6 mt-8 text-sm">Connecting to student...</p>
              </div>

              <div v-if="follower.permission === 'denied' || follower.permission === 'stopped'" class="flex flex-col items-center">
                <img class="mt-20 w-32 xs:w-48" src="/src/assets/img/shocked_col.png" alt="Computer Icon"/>
                <p class="mb-6 mt-8 text-sm font-semibold">
                  {{ follower.permission === 'denied' ? 'Student has declined the permission...' : 'Student stopped sharing their screen...' }}
                </p>
              </div>

              <button class="mb-28 w-36 h-11 flex-shrink-0 font-semibold text-sm text-white bg-blue-500 text-base rounded-3xl hover:bg-blue-400"
                      v-on:click="() => { cancelMonitor() }"
              >
                {{ follower.permission === 'stopped' ? 'Return' : 'Cancel' }}
              </button>
            </div>

            <!--Video content-->
            <div :class="{
                      'hidden': follower.permission !== 'granted'
                     }">
              <video class="w-modal-width-xsm aspect-video"
                     :id="`video_${follower.getUniqueId()}`"
                     muted autoplay
              />
            </div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="w-auto inline-block mt-11 mb-8 ml-9 flex flex-row items-center">
          <button
              :class="{
                'w-56 h-11 flex-shrink-0 text-white bg-blue-500 text-base rounded-lg hover:bg-blue-400': true,
                'bg-blue-400': follower.permission !== 'granted' && follower.monitoring,
              }"
              :disabled="!!(follower.permission !== 'granted' && follower.monitoring)"
              v-on:click="() => { handleMonitorFollowerButton() }"
          >{{ follower.monitoring ? 'Stop screen share' : 'Request live screen share' }}</button>

          <div v-show="follower.permission !== 'granted'" class="has-tooltip">
            <Tooltip
                :tip="'Student permission is required for real time screen monitoring'"
                :toolTipMargin="'ml-2'" :arrowMargin="'ml-3.5'"
            />

            <img class="w-6 h-6 ml-2.5" src="/src/assets/img/icon-help.svg" alt="Help Icon"/>
          </div>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>

<style>
.tooltip {
  @apply invisible absolute;
}

.has-tooltip:hover .tooltip {
  @apply visible z-50;
}

.lds-dual-ring-lg {
  display: inline-block;
  width: 150px;
  height: 150px;
}
.lds-dual-ring-lg:after {
  content: " ";
  display: block;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 2px solid #182B50;
  border-color: #182B50 transparent #182B50 transparent;
  animation: lds-dual-ring-lg 1.2s linear infinite;
}
@keyframes lds-dual-ring-lg {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>