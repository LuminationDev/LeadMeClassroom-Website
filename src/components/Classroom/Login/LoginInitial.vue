<script setup lang="ts">
import GenericButton from "../../Buttons/GenericButton.vue";

defineEmits<{
  (e: 'changeView', newView: string): void
}>()
</script>

<template>
  <div class="flex flex-col items-center">
    <img
        class="w-8 h-8 mb-8"
        src="/src/assets/img/icon-128.png"
        alt="header icon" />

    <p class="text-center mb-3 text-white">I am a...</p>

    <GenericButton
        class="text-white h-11"
        :type="'primary'"
        :callback="() => { $emit('changeView', 'student') }"
    >Student</GenericButton>

    <GenericButton
        class="text-white bg-violet-500 h-11"
        :type="'secondary'"
        :callback="() => { $emit('changeView', 'login') }"
    >Teacher</GenericButton>
  </div>
</template>
