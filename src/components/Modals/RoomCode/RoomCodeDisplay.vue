<script setup lang="ts">
defineProps({
  digit: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: false,
    default: 'middle'
  }
});
</script>

<template>
  <div class="flex items-center bg-white w-48 h-72"
    :class="{
      'rounded-l-lg': position === 'start',
      'mr-3': position !== 'end',
      'rounded-r-lg': position === 'end'
    }"
  >
    <div class="w-full text-center text-9xl">
      {{digit}}
    </div>
  </div>
</template>
