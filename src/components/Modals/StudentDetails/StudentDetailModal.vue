<script setup lang="ts">
import * as REQUESTS from "@/constants/_requests.js";
import "../../../styles.css";
import Modal from "../Modal.vue";
import { computed, defineProps, nextTick, ref } from "vue";
import type { PropType } from "vue";
import type { Follower } from "@/models";
import WebStudentDetails from "@/components/Modals/StudentDetails/WebStudentDetails.vue";
import MobileStudentDetails from "@/components/Modals/StudentDetails/MobileStudentDetails.vue";
import WebFollowerIcon from "@/assets/vue/WebFollowerIcon.vue";
import MobileFollowerIcon from "@/assets/vue/MobileFollowerIcon.vue";
import EditIcon from "@/assets/vue/EditIcon.vue";
import ActionBarModal from "@/components/ActionBar/ActionBarModal.vue";
import { useClassroomStore } from "@/stores/classroomStore";
import TickIcon from "@/assets/vue/TickIcon.vue";
import CrossIcon from "@/assets/vue/CrossIcon.vue";

const classroomPinia = useClassroomStore();

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

const showModal = ref(false);

/**
 * A generic function that can be exposed to the another component.
 */
const openModal = () => {
  showModal.value = true
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

defineExpose({
  openModal
});
</script>

<template>
  <!--Anchor button used to control the modal-->
  <div v-on:click="openModal" class="flex flex-row items-center py-2 px-4 font-medium cursor-pointer">
    <img v-if="iconUrl" class="flex-shrink-0 w-4 h-4 mr-2" :src="iconUrl"  alt=""/>
    <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">{{ taskName }}</span>
  </div>

  <!--Modal body using the Modal template, teleports the html to the bottom of the body tag-->
  <Teleport to="body">
    <Modal :show="showModal" @close="closeModal">
      <template v-slot:header>
        <header class="h-20 px-8 w-modal-width-sm bg-zinc-200 flex justify-between items-center rounded-t-lg">
          <div class="flex flex-row items-center">
            <div v-if="!editName" class="flex flex-row items-center">
              <span class="text-3xl font-medium text-black mr-3">{{ follower.name }}</span>
              <EditIcon v-on:click="showEditInput" class="cursor-pointer" :colour="'#667081'"/>
            </div>

            <div v-else class="flex flex-row items-center">
              <input ref="editInput" class="text-3xl bg-zinc-200 border-2 border-b-black outline-0" :placeholder="follower.name" v-model="name"/>

              <TickIcon v-on:click="changeName" class="cursor-pointer ml-2" :colour="'green'"/>
              <CrossIcon v-on:click="editName = false; name = ''" class="cursor-pointer w-4 h-4 ml-2" :colour="'gray'"/>
            </div>
          </div>

          <div class="flex flex-row items-center">
            <WebFollowerIcon v-if="follower.type === REQUESTS.WEB" :colour="'#BDC3D6'"/>
            <MobileFollowerIcon v-else :colour="'#BDC3D6'"/>

            <img
                v-on:click="closeModal"
                class="w-4 h-4 ml-4 cursor-pointer"
                src="/src/assets/img/modal-icon-exit.svg"
                alt="Close Icon"/>
          </div>
        </header>
      </template>

      <template v-slot:content>
        <div class="bg-zinc-200 h-[32rem]">
          <WebStudentDetails v-if="follower.type === REQUESTS.WEB"
             :follower="follower"
             @screenMonitor="$emit('screenMonitor')"
             @close="closeModal"/>

          <MobileStudentDetails v-else :follower="follower"/>
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
