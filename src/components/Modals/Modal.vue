<script setup lang="ts">
import { useActionStore } from "@/stores/actionStore";

const actionPinia = useActionStore();

defineProps({
  show: Boolean,
  rounded: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <Transition
    enter-from-class="opacity-0 scale-110"
    enter-to-class="opacity-100 scale-100"
    enter-active-class="transition duration-300"
    leave-active-class="transition duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-110"
  >
    <div v-if="show" @mousedown="$emit('close')"
         class="fixed inset-0 bg-modal-site-background
          grid place-items-center font-poppins z-10
          left-30 lg:pl-56">

      <div @mousedown.stop
           class="bg-panel-background overflow-hidden"
           :class="{
              'rounded-lg' : rounded,
              'w-[350px] sm:w-[400px] md:w-[530px] lg:w-[780px] xl:w-[1000px] 2xl:w-[1300px]': actionPinia.viewDescription === '',
              'w-modal-width-set-xxsm': actionPinia.viewDescription !== ''
           }"
      >
        <slot name="header"></slot>
        <slot name="content"></slot>
        <slot name="footer"></slot>
      </div>
    </div>
  </Transition>
</template>
