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
  <div class="flex items-center bg-white w-16 h-40 md:w-32 md:h-52 lg:w-48 lg:h-72"
    :class="{
      'rounded-l-lg': position === 'start',
      'mr-3': position !== 'end',
      'rounded-r-lg': position === 'end'
    }"
  >
    <div class="w-full text-center text-5xl md:text-7xl lg:text-9xl">
      {{digit}}
    </div>
  </div>
</template>
