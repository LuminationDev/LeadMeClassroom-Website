<script setup lang="ts">
import { ref } from "vue";
import Modal from "./Modal.vue";
import { useDashboardStore } from "@/stores/dashboardStore";

defineEmits<{
  (e: 'webModal'): void
  (e: 'appModal'): void
}>()

const dashboardPinia = useDashboardStore();
const showMediaModal = ref(false);

function closeModal() {
  showMediaModal.value = false
}
</script>

<template>
  <!--Anchor button used to control the modal-->
  <button class="
    w-56 h-9 flex justify-center items-center
    bg-blue-500 hover:bg-blue-400
    text-white text-base font-medium"
    v-on:click="showMediaModal = true"
    id="share_button"
  >
    <img class="w-4 h-4 mr-3" src="/src/assets/img/session-icon-share.svg" alt="Icon"/>
      Share media
  </button>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showMediaModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width-xxsm bg-white flex justify-between items-center rounded-t-lg">
          <p class="text-2xl font-medium">Please select what media type to share</p>

          <img
              v-on:click="closeModal"
              class="w-4 h-4 cursor-pointer"
              src="/src/assets/img/modal-icon-exit.svg"
              alt="Close Icon"
          />
        </header>
      </template>

      <template v-slot:content>
        <div class="w-modal-width-xxsm max-h-64">
          <div v-if="dashboardPinia.webFollowers.length !== 0 || dashboardPinia.mobileFollowers.length !== 0"
               class="mt-8 flex flex-row flex-wrap justify-evenly">

            <button class="w-44 h-28 mx-4 text-white text-lg rounded-lg bg-blue-500 hover:bg-blue-300 font-medium"
                 v-on:click="$emit('webModal'); showMediaModal = false">
             Share website
            </button>

            <button v-if="dashboardPinia.mobileFollowers.length !== 0"
                    class="w-44 h-28 mx-4 text-white text-lg rounded-lg bg-blue-500 hover:bg-blue-300 font-medium"
                 v-on:click="$emit('appModal'); showMediaModal = false">
              Share application
            </button>
          </div>

          <div v-else class="flex justify-center items-center bg-gray-200 mt-4 px-5 py-5">
            <span>No students connected</span>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <footer class="mt-8 mb-8 mr-14 text-right flex flex-row justify-end">
          <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default font-medium"
                  v-on:click="showMediaModal = false"
          >Cancel</button>
        </footer>
      </template>
    </Modal>
  </Teleport>
</template>
