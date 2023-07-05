<script setup lang="ts">
import {computed, ref} from "vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { storeToRefs } from "pinia";
import Modal from "../Modal.vue";
import shareContentIconUrl from '/src/assets/img/sideMenu/menu-icon-sharecontent.svg';
import ShareVideoInsert from "@/components/Modals/ShareContent/ShareVideoInsert.vue";
import ShareApplicationInsert from "@/components/Modals/ShareContent/ShareApplicationInsert.vue";
import ShareWebsiteInsert from "@/components/Modals/ShareContent/ShareWebsiteInsert.vue";
import CuratedContentInsert from "@/components/Modals/ShareContent/CuratedContentInsert.vue";
import curatedImageUrl from '/src/assets/img/share-content-curated.svg';
import mobileIconUrl from '/src/assets/img/share-content-mobile.svg';
import devicesIconUrl from '/src/assets/img/share-content-devices.svg';
import linkIconUrl from '/src/assets/img/share-content-link.svg';

const classroomPinia = useClassroomStore();
const panelName = 'shareContent';

// TODO change the layout depending on the follower types/numbers
const { webFollowers, mobileFollowers } = storeToRefs(classroomPinia)
const showModal = ref(false);
const sharePanel = ref('menu');

const classCode = computed(() => {
  return classroomPinia.classCode !== ''
})

function openModal() {
  if(classCode.value) {
    classroomPinia.view = panelName
    showModal.value = true
  }
}

function closeModal() {
  showModal.value = false
  sharePanel.value = 'menu';
  classroomPinia.view = 'classroom'
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button :class="{
        'h-12 w-48 ml-4 pl-3 flex items-center rounded-lg font-light': true,
        'cursor-pointer': classCode,
        'cursor-default': !classCode,
        'bg-white-menu-overlay': classroomPinia.view === panelName && classCode,
        'hover:bg-white-menu-overlay': classCode,
      }"
    v-on:click="openModal"
    id="share_button"
  >
    <img :class="{
        'w-5 h-5 mr-3': true,
        'contrast-50 brightness-75': !classCode
    }" :src="shareContentIconUrl" alt="Icon"/>

    <span :class="{
      'text-base': true,
      'text-white': classCode,
      'text-gray-400': !classCode
    }">
      Share Content
    </span>
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-16 px-8 w-modal-width-sm bg-gray-300 flex justify-between items-center rounded-t-lg">
          <p class="text-2xl font-medium">Share Content</p>

          <img
              v-on:click="closeModal"
              class="w-4 h-4 cursor-pointer"
              src="/src/assets/img/modal-icon-exit.svg"
              alt="Close Icon"
          />
        </header>
      </template>

      <template v-slot:content>
        <div v-if="sharePanel === 'menu'" class="w-modal-width-sm bg-gray-300 pb-3 px-3">
          <!--Show the url input screen-->
          <div class="flex justify-between items-center
              text-gray-400 text-lg
              bg-white rounded-2xl p-1 h-16 cursor-pointer"
              v-on:click="sharePanel = 'url'">

            <!--Placeholder to keep the url text centered-->
            <div class="w-5 h-5 ml-5"></div>

            <div class="flex justify-center items-center">
              <img class="w-5 h-5 mr-3" :src="linkIconUrl" alt="Icon"/>
              Share a Custom URL
            </div>

            <img class="w-5 h-5 mr-5" :src="devicesIconUrl" alt="Icon"/>
          </div>

          <div class="flex mt-2 h-96">
            <!--Show the curated content screen-->
            <div
              class="w-1/2 p-1 mr-1 flex flex-col
              justify-center items-center
              bg-white text-center rounded-2xl
              cursor-pointer"
              v-on:click="sharePanel = 'curated'"
            >
              <img class="w-48 h-48 mb-3" :src="curatedImageUrl" alt="Icon"/>
              <div class="text-lg flex flex-row items-center mb-3">
                Curated Content
                <img class="w-5 h-5 ml-2" :src="devicesIconUrl" alt="Icon"/>
              </div>
              <div class="text-sm text-gray-400">Curated immersive learning videos.</div>
            </div>

            <div class="w-1/2 h-full ml-1 flex flex-col">
              <!--Show the local video screen-->
              <div
                class="h-1/2 flex flex-col justify-center
                items-center bg-white text-center
                rounded-2xl cursor-pointer"
                v-on:click="sharePanel = 'video'"
              >
                <div class="text-lg flex flex-row items-center mb-3">
                  Videos
                  <img class="w-5 h-5 ml-2" :src="mobileIconUrl" alt="Icon"/>
                </div>
                <div class="text-sm text-gray-400">Local videos on mobile.</div>
              </div>

              <!--Show the local application screen-->
              <div
                class="h-1/2 flex flex-col justify-center
                items-center mt-2 bg-white text-center
                rounded-2xl cursor-pointer"
                v-on:click="sharePanel = 'app'"
              >
                <div class="text-lg flex flex-row items-center mb-3">
                  Apps
                  <img class="w-5 h-5 ml-2" :src="mobileIconUrl" alt="Icon"/>
                </div>
                <div class="text-sm text-gray-400">Immersive learning apps.</div>
              </div>
            </div>
          </div>
        </div>

        <ShareWebsiteInsert v-else-if="sharePanel === 'url'" @back="sharePanel = 'menu'"/>
        <CuratedContentInsert v-else-if="sharePanel === 'curated'" @back="sharePanel = 'menu'"/>
        <ShareVideoInsert v-else-if="sharePanel === 'video'" @back="sharePanel = 'menu'"/>
        <ShareApplicationInsert v-else-if="sharePanel === 'app'" @back="sharePanel = 'menu'"/>
      </template>
    </Modal>
  </Teleport>
</template>
