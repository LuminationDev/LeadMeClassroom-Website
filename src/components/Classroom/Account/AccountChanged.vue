<script setup lang="ts">
import CircleTickIcon from "@/assets/vue/CircleTickIcon.vue";

defineProps({
  changed: {
    type: Boolean,
    required: true,
  },
  saved: {
    type: Boolean,
    required: true,
  },
});
</script>

<template>
  <Transition name="fade" mode="out-in">
    <div v-if="changed" class="flex flex-row ml-2 items-center text-sm text-blue-400 font-semibold">
      <img class="w-4 mr-1" src="/src/assets/img/account-icon-alert-blue.svg" alt="alert"/>
      Not saved
    </div>
    <div v-else-if="saved" class="flex flex-row ml-2 items-center text-sm text-green-400 font-semibold">
      <CircleTickIcon class="w-4 mr-1" :colour="'green'"/>
      Saved successfully
    </div>
  </Transition>
</template>
