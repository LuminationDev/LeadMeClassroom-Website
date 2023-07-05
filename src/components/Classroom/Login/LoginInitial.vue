<script setup lang="ts">
import GenericButton from "../../Buttons/GenericButton.vue";

const emit = defineEmits<{
  (e: 'changeView', newView: string): void
}>()
</script>

<template>
  <div>

    Welcome to
    <img src="/src/assets/img/icon-popup-header.svg" />
    <hr />

    <p class="text-left mb-3 text-gray-separator">I am a...</p>
    <GenericButton :type="'primary'" :callback="() => { $emit('changeView', 'student') }">Student</GenericButton>

    <div class="relative mb-3">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-b border-gray-separator"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="bg-white px-2 pb-0.5 text-sm text-gray-separator">or</span>
      </div>
    </div>

    <GenericButton
        class="bg-panel-background border border-blue-500 border-2 hover:bg-white-menu-overlay"
        :type="'secondary'"
        :callback="() => { $emit('changeView', 'login') }"
    >Teacher</GenericButton>
  </div>
</template>
