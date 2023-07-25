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
  <div class="w-full flex flex-row justify-end rounded-3xl">
    <div
        @mouseenter="pressed = true" @mousedown="pressed = true" @mouseleave="pressed = false"
        @touchstart="pressed = true" @touchend="pressed=false"
        class="h-9 rounded-3xl text-base
          text-white cursor-pointer bg-gray-400 hover:bg-gray-300"
        :class="{
        'button-collapse': !pressed,
        'button-expanded': pressed
      }"
    >
      <div class="flex flex-row items-center h-full button-item">
        <div class="button-text">
          {{text}}
        </div>
        <div class="mx-3 button-icon">
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.button-expanded {
  transition: .2s linear;

  .button-item {
    @apply justify-end
  }

  .button-text {
    opacity: 1;
    animation: animate .2s linear forwards;
    @apply text-end whitespace-nowrap overflow-hidden -mr-1 ml-3
  }
  width: 100%;
}

.button-collapse {
  transition: .2s linear;
  .button-text {
    opacity: 0;
    width: 0;
    animation: animate-reverse .2s linear forwards;
    @apply text-end whitespace-nowrap overflow-hidden
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
    justify-content: flex-end;
  }
  99% {
    justify-content: flex-end;
  }
  100% {
    justify-content: center;
  }
}
</style>
