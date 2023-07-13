<script setup lang="ts">
import { ref } from "vue";
import RoomCodeDisplay from "@/components/Modals/RoomCode/RoomCodeDisplay.vue";

const props = defineProps({
  classCode: {
    type: String,
    required: true
  }
});

const showModal = ref(false);

const checkPosition = (index: Number): String => {
  const isFirst = index === 0;
  const isLast = index === props.classCode.split('').length - 1;
  return isFirst ? 'start' : isLast ? 'end' : 'middle';
}
</script>

<template>
  <button
      class="menu-item menu-item--room-code bg-blue-500 flex
        text-sm text-white font-poppins font-semibold
        rounded-md hover:bg-blue-300"

      v-on:click="showModal = true"
  >
    <span class="menu-item-text">Room Code: {{ classCode }}</span>
    <img :class="{
        'w-5 h-5 menu-item-icon menu-item-icon--room-code': true,
        'contrast-50 brightness-75': !classCode
      }" src="/src/assets/img/key.svg" alt="Room code icon"/>
  </button>

  <Teleport to="body">
    <Transition
        enter-from-class="opacity-0 scale-110"
        enter-to-class="opacity-100 scale-100"
        enter-active-class="transition duration-300"
        leave-active-class="transition duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-110"
    >
      <div v-if="showModal"
           class="fixed inset-0 bg-navy-side-menu
            grid place-items-center font-poppins z-50">

        <div class="flex flex-col items-center overflow-hidden w-full">
          <div class="flex flex-col text-black">
            <div class="flex justify-start mb-5">
              <img
                  class="h-11"
                  src="../../../assets/img/icon-dashboard-logo.svg"
                  alt="leadme icon"/>
            </div>

            <!--Display the individual digits from the class code-->
            <div class="flex flex-row">
              <div v-for="(item, index) in classCode.split('')" v-bind:key="index">
                <RoomCodeDisplay :digit="item" :position="checkPosition(index)"/>
              </div>
            </div>

            <div class="flex justify-end mt-4">
              <button
                class="h-20 w-48 bg-blue-500
                text-3xl text-white font-poppins font-semibold
                rounded-3xl hover:bg-blue-300"
                  v-on:click="showModal = false"
              >Done</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
