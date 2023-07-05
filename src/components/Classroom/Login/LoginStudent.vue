<script setup lang="ts">
import GenericButton from "@/components/Buttons/GenericButton.vue";

const emit = defineEmits<{
  (e: 'changeView', newView: string): void
}>()

const openInNewTab = (href: string) => {
  Object.assign(document.createElement('a'), {
    target: '_blank',
    rel: 'noopener noreferrer',
    href: href,
  }).click();
}
</script>

<template>
  <div class="flex flex-col items-center">
    <img
        class="h-32"
        src="/src/assets/img/login/student-extension-example.svg"
        alt="header icon" />

    <p class="text-center mb-12 text-white text-xl">Open the LeadMe Extension from you menu bar</p>

    <p class="text-center mb-12 text-gray-300 text-sm">Or</p>

    <div>
      <GenericButton
          class="text-white h-11 text-sm"
          :type="'primary'"
          :callback="() => { openInNewTab('https://chrome.google.com/webstore/category/extensions') }"
      >Add to Chrome</GenericButton>

      <div class="font-medium">
        <span
            class="cursor-pointer text-blue-400 text-sm"
            v-on:click="() => { emit('changeView', 'login') }"
        >Login as Teacher</span>
      </div>
    </div>
  </div>
</template>
