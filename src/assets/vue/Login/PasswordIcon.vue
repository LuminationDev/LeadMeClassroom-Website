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
    <rect x="5.33334" y="12" width="21.3333" height="16" rx="4" :stroke="colour" stroke-width="2"/>
    <path d="M16 21.3332L16 18.6665" :stroke="colour" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21.3333 12V8C21.3333 5.79086 19.5425 4 17.3333 4H14.6667C12.4575 4 10.6667 5.79086 10.6667 8L10.6667 12" :stroke="colour" stroke-width="2"/>
  </svg>
</template>