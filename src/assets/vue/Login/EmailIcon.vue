<script setup lang="ts">
defineProps({
  colour: {
    type: String,
    required: false,
    default: '#fffff'
  }
});
</script>

<template>
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2.66669" y="5.3335" width="26.6667" height="21.3333" rx="5" :stroke="colour" stroke-width="2"/>
    <path d="M8 12L14.8 17.1C15.5111 17.6333 16.4889 17.6333 17.2 17.1L24 12" :stroke="colour" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>
