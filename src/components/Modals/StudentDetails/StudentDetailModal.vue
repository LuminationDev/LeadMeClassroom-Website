<script setup lang="ts">
import * as REQUESTS from "@/constants/_requests.js";
import "../../../styles.css";
import Modal from "../Modal.vue";
import WebStudentDetails from "@/components/Modals/StudentDetails/WebStudentDetails.vue";
import MobileStudentDetails from "@/components/Modals/StudentDetails/MobileStudentDetails.vue";
import EditIcon from "@/assets/vue/EditIcon.vue";
import ActionBarModal from "@/components/ActionBar/ActionBarModal.vue";
import TickIcon from "@/assets/vue/TickIcon.vue";
import CrossIcon from "@/assets/vue/CrossIcon.vue";
import SearchFilter from "@/components/Modals/ShareContent/SearchFilter.vue";
import { computed, nextTick, ref, watch } from "vue";
import type { PropType } from "vue";
import type { Follower, MobileFollower, WebFollower } from "@/models";
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();

defineEmits<{
  (e: 'screenMonitor'): void
}>()

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
});

const taskName = computed(() => {
  return props.follower.activeTaskName
});

const iconUrl = computed(() => {
  return props.follower.activeTaskIconUrl
});

const searchQuery = ref("");
const showModal = ref(false);

/**
 * Track the share content modal, if this is open the details modal should close.
 */
watch(() => actionPinia.showModal, (newValue) => {
  if(newValue) {
    showModal.value = false;
  }
});

/**
 * A generic function that can be exposed to the another component.
 */
const openModal = () => {
  showModal.value = true
  console.log('showeeeddede')
}

const closeModal = () => {
  showModal.value = false;
}

const editName = ref(false);
const name = ref('');
const editInput = ref<HTMLInputElement | null>(null)
const showEditInput = () => {
  editName.value = true
  nextTick(() => {
    editInput.value!.focus();
  });
}

const changeName = () => {
  if(name.value.length === 0) { return; }
  classroomPinia.renameFollower(name.value, props.follower.getUniqueId(), props.follower.type);

  //Change the local follower data
  classroomPinia.updateFollowerData(
      props.follower.getUniqueId(),
      props.follower.type,
      'name',
      name.value);

  name.value = '';

  editName.value = false;
}

// todo - I don't like this casting here, there must be a better way to do it
const mFollower = computed((): MobileFollower => {
    return props.follower as MobileFollower
})
const wFollower = computed((): WebFollower => {
  return props.follower as WebFollower
})

defineExpose({
  openModal
});
</script>

<template>
  <!--Anchor button used to control the modal-->
  <div v-on:click="openModal" class="flex flex-row items-center py-2 px-4 font-medium cursor-pointer">
    <img v-if="iconUrl" class="flex-shrink-0 w-4 h-4 mr-2" :src="iconUrl"  alt=""/>
    <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">{{ follower.locked ? '&nbsp;' : taskName }}</span>
  </div>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 bg-zinc-200 flex justify-between items-center rounded-t-lg w-full">
          <div class="flex flex-row items-center">
            <div v-if="!editName" class="flex flex-row items-center w-full mr-3">
              <span class="text-3xl font-medium text-black mr-3">{{ follower.name }}</span>
              <EditIcon v-on:click="showEditInput" class="cursor-pointer" :colour="'#667081'"/>
            </div>

            <div v-else class="flex flex-row items-center w-full">
              <input ref="editInput" class="text-3xl w-full bg-zinc-200 border-2 border-b-black outline-0" :placeholder="follower.name" v-model="name"/>

              <TickIcon v-on:click="changeName" class="cursor-pointer ml-2" :colour="'green'"/>
              <CrossIcon v-on:click="editName = false; name = ''" class="cursor-pointer w-4 h-4 ml-2" :colour="'gray'"/>
            </div>
          </div>

          <div v-if="!editName" class="flex flex-row justify-between">
            <SearchFilter
                :show-filter="false"
                :enable-filter="false"
                v-model="searchQuery"
                :placeholder="follower.type === REQUESTS.WEB ? 'Search tabs' : 'Search applications'"/>

            <img
                v-on:click="closeModal"
                class="cursor-pointer"
                src="/src/assets/img/modal-icon-exit.svg"
                alt="Close Icon"/>
          </div>
        </header>
      </template>

      <template v-slot:content>
        <div class="bg-zinc-200 h-[32rem]">
          <WebStudentDetails v-if="follower.type === REQUESTS.WEB"
             :follower="wFollower"
             :search-query="searchQuery"
             @screenMonitor="$emit('screenMonitor')"
             @close="closeModal"/>

          <MobileStudentDetails v-else :follower="mFollower" :search-query="searchQuery"/>
        </div>
      </template>

      <template v-slot:footer>
        <div class="w-full bg-zinc-200 pb-4 pt-2">
          <ActionBarModal
              class="mx-4 h-12"
              :follower="follower"
              @screenMonitor="$emit('screenMonitor')"
              @close="closeModal"/>
        </div>
      </template>
    </Modal>
  </Teleport>
</template>
