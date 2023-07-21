<script setup lang="ts">
import { ref } from 'vue';

defineProps({
  text: {
    type: String
  }
});

const pressed = ref(false);
</script>

<template>
  <div
      @mouseenter="pressed = true" @mousedown="pressed = true" @mouseleave="pressed = false"
      @touchstart="pressed = true" @touchend="pressed=false"
      class="h-9 flex justify-center items-center rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
      :class="{
        '2xl:pl-3 2xl:pr-4 button-collapse': !pressed,
        'w-auto pl-3 pr-4 button-expanded': pressed
      }"
   >
    <div class="flex flex-row items-center">
      <slot></slot>

      <span :class="{
          'hidden 2xl:block 2xl:ml-1 button-text-expanded': !pressed,
          'ml-1 button-text-collapse': pressed
        }"
      >{{text}}</span>
    </div>
  </div>
</template>

<style lang="scss">
.button-expanded {
  transition: 0.2s ease-in-out;

  .button-text-expanded {
    opacity: 1;
    animation: animate 0.2s linear forwards;
    @apply text-start whitespace-nowrap overflow-hidden
  }
}

.button-collapse {
  transition: 0.2s ease-in-out;

  .button-text-collapse {
    opacity: 0;
  }

  @apply w-12 lg:w-20 2xl:w-auto
}

@keyframes animate {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
</style>
