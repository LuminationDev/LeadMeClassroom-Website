<script setup lang="ts">
import { computed, ref } from "vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import * as REQUESTS from "@/constants/_requests";
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
import AlertIcon from "@/assets/vue/AlertIcon.vue";
import modalExit from '/src/assets/img/modal-icon-exit.svg';
import popupBack from '/src/assets/img/popup-icon-back.svg';

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();
const panelName = 'shareContent';
const sharePanel = ref('menu');
const searchQuery = ref("");
const showFilter = ref(false);

const classCode = computed(() => {
  return classroomPinia.classCode !== '' && classroomPinia.view === 'classroom'
})

/**
 * Monitor if any web followers are selected as this will disable the video and application
 * sharing panels.
 */
const webStudents = computed(()  => {
  return actionPinia.selectedFollowers.filter(follower => follower.type === REQUESTS.WEB).length > 0;
});

const openModal = () => {
  if(classCode.value) {
    classroomPinia.view = panelName
    actionPinia.showModal = true
  }
}

/**
 * Change the current content panel, if there are web users do not allow changing to the
 * video or application sharing panels.
 * @param panel A string representing the type of content to be shared.
 */
const changePanel = (panel: string) => {
  if(webStudents.value && (panel === "video" || panel === "app")) {
    return;
  }

  sharePanel.value = panel;
  actionPinia.selectedItems = [];
}

/**
 * Display an individual description insert. This can be triggered from the curated content insert
 * but can be expanded in the future to handle the video/application descriptions.
 * @param data
 */
const updateViewItem = (data: string) => {
  actionPinia.viewDescription = data;
  sharePanel.value = 'viewItem';
}

/**
 * Navigate back through the Modal's inserts, deciding whether to show a different insert or close
 * the modal entirely.
 */
const back = () => {
  searchQuery.value = '';

  switch(sharePanel.value) {
    case 'video':
    case 'app':
    case 'curated':
      sharePanel.value = 'menu';
      break;
    case 'viewItem':
      actionPinia.viewDescription = '';
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
const closeModal = () => {
  actionPinia.showModal = false
  actionPinia.viewDescription= '';
  classroomPinia.view = 'classroom';

  if(sharePanel.value === 'viewItem') {
    sharePanel.value = 'curated';
  }
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button :class="{
        'flex menu-item rounded-lg font-light': true,
        'cursor-pointer': classCode,
        'cursor-default': !classCode,
        'bg-white-menu-overlay': classroomPinia.view === panelName && classCode,
        'hover:bg-white-menu-overlay': classCode,
      }"
    v-on:click="openModal"
    id="share_button"
  >
    <img :class="{
        'w-5 h-5 menu-item-icon': true,
        'contrast-50 brightness-75': !classCode
    }" :src="shareContentIconUrl" alt="Icon"/>

    <span class="menu-item-text" :class="{
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
          'px-4': sharePanel !== 'curated' && sharePanel !== 'viewItem',
          'px-5': sharePanel === 'curated',
          'w-modal-width-set-xxsm px-4': sharePanel === 'viewItem'
        }">
          <div v-if="actionPinia.viewDescription === ''">
            <p class="text-2xl font-medium">Share Content</p>
          </div>
          <div v-else class="flex flex-row">
            <img src="/src/assets/img/share-content-video.svg" alt="Video"/>
            <p class="ml-2 text-lg font-medium">{{actionPinia.viewDescription}}</p>
          </div>

          <div class="flex flex-row items-center">
            <!--Search and Filter content-->
            <SearchFilter v-if="sharePanel !== 'menu' && sharePanel !== 'viewItem'"
                          :placeholder="'Search titles'"
                          :show-filter="showFilter"
                          :enable-filter="sharePanel === 'curated'"
                          @changeFilter="showFilter = !showFilter"
                          v-model="searchQuery"/>

            <div v-if="webStudents && sharePanel === 'menu'"
              class="h-9 flex items-center ml-2 pl-3 pr-4 rounded-3xl
              text-base text-white bg-blue-500"
            >
              <AlertIcon class="mr-1" :colour="'white'" />
              <span class="text-white text-sm">You have desktop students selected</span>
            </div>

            <img
                v-on:click="back"
                class="w-4 h-4 ml-8 cursor-pointer"
                :src="sharePanel === 'menu' ? modalExit : popupBack"
                alt="Close Icon"/>
          </div>
        </header>
      </template>

      <template v-slot:content>
        <div v-if="sharePanel === 'menu'" class="bg-gray-300 pb-3 px-3">
          <!--Show the url input screen-->
          <ShareCustomURL @close="closeModal" />

          <div class="flex mt-2 h-96">
            <!--Show the curated content screen-->
            <div class="w-1/2 p-1 mr-1 flex flex-col justify-center
                items-center bg-white text-center rounded-2xl
                cursor-pointer hover:bg-slate-100"
              v-on:click="changePanel('curated')"
            >
              <img class="w-48 h-48 mb-3" :src="curatedImageUrl" alt="Icon"/>
              <div class="text-lg flex flex-row items-center mb-3 font-semibold">
                Curated Content
                <img class="w-5 h-5 ml-2" :src="devicesIconUrl" alt="Icon"/>
              </div>
              <div class="text-sm text-gray-400">Curated immersive learning videos.</div>
            </div>

            <div class="w-1/2 h-full ml-1 flex flex-col">
              <!--Show the local video screen-->
              <div
                :class="{
                  'h-1/2 flex flex-col justify-center items-center bg-white text-center rounded-2xl': true,
                  'cursor-pointer hover:bg-slate-100': !webStudents,
                  'bg-opacity-50': webStudents
                }"
                v-on:click="changePanel('video')"
              >
                <div :class="{
                    'text-lg text-black flex flex-row items-center mb-3 font-semibold': true,
                    'text-opacity-40': webStudents
                  }"
                >
                  Videos
                  <img class="w-5 h-5 ml-2" :src="mobileIconUrl" alt="Icon"/>
                </div>

                <div :class="{
                    'text-sm text-gray-400': true,
                    'text-opacity-50': webStudents
                  }"
                >Local videos on mobile.</div>
              </div>

              <!--Show the local application screen-->
              <div
                :class="{
                  'h-1/2 flex flex-col justify-center items-center mt-2 bg-white text-center rounded-2xl': true,
                  'cursor-pointer hover:bg-slate-100': !webStudents,
                  'bg-opacity-50': webStudents
                }"
                v-on:click="changePanel('app')"
              >
                <div :class="{
                    'text-lg text-black flex flex-row items-center mb-3 font-semibold': true,
                    'text-opacity-40': webStudents
                  }"
                >
                  Apps
                  <img class="w-5 h-5 ml-2" :src="mobileIconUrl" alt="Icon"/>
                </div>

                <div :class="{
                    'text-sm text-gray-400': true,
                    'text-opacity-50': webStudents
                  }"
                >Immersive learning apps.</div>
              </div>
            </div>
          </div>
        </div>

        <ShareCuratedContentInsert v-else-if="sharePanel === 'curated' || sharePanel === 'viewItem'"
          @viewItem="updateViewItem"
          @closeFilter="showFilter = false"
          :search-query="searchQuery"
          :show-filter="showFilter"/>

        <ShareVideoInsert v-else-if="sharePanel === 'video'" :search-query="searchQuery"/>
        <ShareApplicationInsert v-else-if="sharePanel === 'app'" :search-query="searchQuery"/>
      </template>
    </Modal>
  </Teleport>
</template>
