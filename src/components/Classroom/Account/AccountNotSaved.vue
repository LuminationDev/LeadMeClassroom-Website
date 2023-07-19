<script setup lang="ts">
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
</script>

<template>
  <Transition name="fade" mode="out-in">
    <div v-if="show" class="flex flex-row ml-2 text-sm text-blue-400 font-semibold">
      <img class="w-3.5 mr-1" src="/src/assets/img/account-icon-alert-blue.svg" alt="alert"/>
      Not saved
    </div>
  </Transition>
</template>
