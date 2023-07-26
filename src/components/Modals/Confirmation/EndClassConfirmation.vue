<script setup lang="ts">
import endClassIconUrl from '/src/assets/img/sideMenu/menu-icon-endclass.svg';
import ClassroomMenuItem from "@/components/Classroom/SideMenu/ClassroomMenuItem.vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import { computed, ref } from "vue";

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();

const classCode = computed(() => {
  return classroomPinia.classCode !== ''
})

const showModal = ref(false);

async function endSession() {
  if (!classCode.value) {
    return;
  }

  closeModal();

  actionPinia.selectedFollowers = [];
  await classroomPinia.endSession();
}

const openModal = () => {
  if (!classCode.value) {
    return;
  }

  showModal.value = true
}

const closeModal = () => {
  showModal.value = false;
}
</script>

<template>
  <ClassroomMenuItem
      :icon="endClassIconUrl"
      :enabled="classCode"
      :panel="''"
      v-on:click="openModal"
      view="/"
  >End Class</ClassroomMenuItem>

  <Teleport to="body">
    <Transition
        enter-from-class="opacity-0 scale-110"
        enter-to-class="opacity-100 scale-100"
        enter-active-class="transition duration-300"
        leave-active-class="transition duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-110"
    >
      <div v-if="showModal" @mousedown="closeModal"
           class="fixed inset-0 bg-modal-site-background
          grid place-items-center font-poppins z-10
          left-30 lg:pl-56">

        <div @mousedown.stop class="flex flex-col w-96 h-80 bg-zinc-200 overflow-hidden rounded-lg">
          <div class="flex flex-row justify-between px-5 pt-5">
            <div class="text-xl font-semibold">
              Are you sure?
            </div>
            <img v-on:click="closeModal" class="cursor-pointer w-4" src="/src/assets/img/cross.svg" alt="exit"/>
          </div>

          <div class="flex flex-col flex-grow px-9 justify-center items-center">
            <div class="text-sm text-center mb-6">
              Ending the class will disconnect all students, and remove all active lesson content.
            </div>

            <div v-on:click="endSession" class="flex justify-center items-center w-56 h-9 cursor-pointer mb-2 rounded-lg bg-red-600 text-sm text-white hover:bg-red-500">
              Yes, end the class
            </div>

            <div v-on:click="closeModal" class="flex justify-center items-center w-56 h-9 cursor-pointer rounded-lg bg-gray-400 text-sm text-white hover:bg-gray-300">
              Back
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
