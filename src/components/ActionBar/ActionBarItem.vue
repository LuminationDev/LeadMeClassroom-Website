<script setup lang="ts">
import {computed, ref} from 'vue';

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
      class="h-9 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
      :class="{
        'button-collapse': !pressed,
        'button-expanded': pressed
      }"
   >
    <div class="flex flex-row items-center h-full button-item mx-3">
      <div class="button-icon">
        <slot></slot>
      </div>
      <div class="button-text">
        {{text}}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.button-expanded {
  transition: .2s linear;

  .button-item {
    @apply justify-start
  }

  .button-text {
    opacity: 1;
    animation: animate .2s linear forwards;
    @apply text-start whitespace-nowrap overflow-hidden ml-2
  }
  width: 100%;
}

.button-collapse {
  transition: .2s linear;
  .button-item {
    animation: flex-to-center .2s linear forwards;
    @apply justify-center
  }

  .button-text {
    opacity: 0;
    width: 0;
    animation: animate-reverse .2s linear forwards;
    @apply text-start whitespace-nowrap overflow-hidden
  }
  @apply w-12
}

@keyframes animate-reverse {
  0% {
    width: 100%;
    opacity: 1;
  }
  25% {
    opacity: 0;
  }
  100% {
    width: 0;
    opacity: 0;
  }
}

@keyframes animate {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

@keyframes flex-to-center {
  0% {
    justify-content: flex-start;
  }
  99% {
    justify-content: flex-start;
  }
  100% {
    justify-content: center;
  }
}
</style>
