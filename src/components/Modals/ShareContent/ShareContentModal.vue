<script setup lang="ts">
import { computed, ref } from "vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import Modal from "../Modal.vue";
import shareContentIconUrl from '/src/assets/img/sideMenu/menu-icon-sharecontent.svg';
import ShareVideoInsert from "@/components/Modals/ShareContent/ShareVideoInsert.vue";
import ShareApplicationInsert from "@/components/Modals/ShareContent/ShareApplicationInsert.vue";
import ShareCuratedContentInsert from "@/components/Modals/ShareContent/ShareCuratedContentInsert.vue";
import curatedImageUrl from '/src/assets/img/share-content-curated.svg';
import mobileIconUrl from '/src/assets/img/share-content-mobile.svg';
import devicesIconUrl from '/src/assets/img/share-content-devices.svg';
import ShareCustomURL from "@/components/Modals/ShareContent/ShareCustomURL.vue";
import SearchFilter from "@/components/Modals/ShareContent/SearchFilter.vue";

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();
const panelName = 'shareContent';
const viewDescription = ref('');
const sharePanel = ref('menu');
const searchQuery = ref("");
const showFilter = ref(false);

const classCode = computed(() => {
  return classroomPinia.classCode !== ''
})

function openModal() {
  if(classCode.value) {
    classroomPinia.view = panelName
    actionPinia.showModal = true
  }
}

/**
 * Display an individual description insert. This can be triggered from the curated content insert
 * but can be expanded in the future to handle the video/application descriptions.
 * @param data
 */
function updateViewItem(data: string) {
  viewDescription.value = data;
  sharePanel.value = 'viewItem';
}

/**
 * Navigate back through the Modal's inserts, deciding whether to show a different insert or close
 * the modal entirely.
 */
function back() {
  switch(sharePanel.value) {
    case 'curated':
      sharePanel.value = 'menu';
      break;
    case 'viewItem':
      viewDescription.value = '';
      sharePanel.value = 'curated';
      break;
    default:
      closeModal();
      break;
  }
}

/**
 * Close the modal and reset the view to 'classroom' to change the side menu highlight
 * back to the correct position.
 */
function closeModal() {
  actionPinia.showModal = false
  viewDescription.value = '';
  classroomPinia.view = 'classroom';

  if(sharePanel.value === 'viewItem') {
    sharePanel.value = 'curated';
  }
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
    <Modal class="z-40" :show="actionPinia.showModal" @close="closeModal">
      <template v-slot:header>
        <header :class="{
          'h-16 bg-gray-300 flex justify-between items-center rounded-t-lg': true,
          'w-modal-width-sm px-8': sharePanel !== 'curated' && sharePanel !== 'viewItem',
          'w-modal-width px-8': sharePanel === 'curated',
          'w-modal-width-set-xxsm px-4': sharePanel === 'viewItem'
        }">
          <div v-if="viewDescription === ''">
            <p class="text-2xl font-medium">Share Content</p>
          </div>
          <div v-else class="flex flex-row">
            <img src="src/assets/img/share-content-video.svg" alt="Video"/>
            <p class="ml-2 text-lg font-medium">{{viewDescription}}</p>
          </div>

          <div class="flex flex-row items-center">
            <!--Search and Filter content-->
            <SearchFilter v-if="sharePanel === 'curated'"
                          :show-filter="showFilter"
                          @changeFilter="showFilter = !showFilter"
                          v-model="searchQuery"/>

            <img
                v-on:click="back"
                class="w-4 h-4 ml-8 cursor-pointer"
                :src="sharePanel === 'menu' ? '/src/assets/img/modal-icon-exit.svg': '/src/assets/img/popup-icon-back.svg'"
                alt="Close Icon"/>
          </div>
        </header>
      </template>

      <template v-slot:content>
        <div v-if="sharePanel === 'menu'" class="w-modal-width-sm bg-gray-300 pb-3 px-3">
          <!--Show the url input screen-->
          <ShareCustomURL @close="closeModal" />

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

        <ShareCuratedContentInsert v-else-if="sharePanel === 'curated' || sharePanel === 'viewItem'"
          @close="closeModal"
          @back="sharePanel = 'menu'"
          @viewItem="updateViewItem"
          @closeFilter="showFilter = false"
          :search-query="searchQuery"
          :show-filter="showFilter"
          :view-description="viewDescription"/>

        <ShareVideoInsert v-else-if="sharePanel === 'video'" @back="sharePanel = 'menu'"/>
        <ShareApplicationInsert v-else-if="sharePanel === 'app'" @back="sharePanel = 'menu'"/>
      </template>
    </Modal>
  </Teleport>
</template>
