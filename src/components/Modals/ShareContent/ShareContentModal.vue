<script setup lang="ts">
import {computed, ref} from "vue";
import Modal from "../Modal.vue";
import { useDashboardStore } from "@/stores/dashboardStore";
import {storeToRefs} from "pinia";
import shareContentIconUrl from '/src/assets/img/sideMenu/menu-icon-sharecontent.svg';

const dashboardPinia = useDashboardStore();
const { webFollowers, mobileFollowers } = storeToRefs(dashboardPinia)
const showModal = ref(false);

const classCode = computed(() => {
  return dashboardPinia.classCode !== ''
})

function openModal() {
  if(classCode.value) {
    showModal.value = true
  }
}

function closeModal() {
  showModal.value = false
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button :class="{
        'h-12 w-48 ml-4 pl-3 flex items-center rounded-lg font-light': true,
        'cursor-pointer': classCode,
        'cursor-default': !classCode,
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
        <div class="w-modal-width-sm bg-gray-300 pb-3 px-3">
          <!--Show the url input screen-->
          <div class="flex justify-center items-center bg-white rounded-2xl p-1 h-16">
            Share a Custom URL
          </div>

          <div class="flex mt-2 h-96">
            <!--Show the curated content screen-->
            <div class="w-1/2 p-1 mr-1 flex justify-center items-center bg-white text-center rounded-2xl">
              Curated Content
            </div>

            <div class="w-1/2 h-full ml-1 flex flex-col">
              <!--Show the local video screen-->
              <div class="h-1/2 flex justify-center items-center bg-white text-center rounded-2xl">
                Videos
              </div>

              <!--Show the local application screen-->
              <div class="h-1/2 flex justify-center items-center mt-2 bg-white text-center rounded-2xl">
                Apps
              </div>
            </div>
          </div>
        </div>
      </template>
    </Modal>
  </Teleport>
</template>
