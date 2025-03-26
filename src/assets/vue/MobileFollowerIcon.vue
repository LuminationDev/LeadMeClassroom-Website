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
  <svg width="18" height="26" viewBox="0 0 18 26" :stroke="colour" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1.5 4.25C1.5 3.58696 1.76339 2.95107 2.23223 2.48223C2.70107 2.01339 3.33696 1.75 4 1.75H14C14.663 1.75 15.2989 2.01339 15.7678 2.48223C16.2366 2.95107 16.5 3.58696 16.5 4.25V21.75C16.5 22.413 16.2366 23.0489 15.7678 23.5178C15.2989 23.9866 14.663 24.25 14 24.25H4C3.33696 24.25 2.70107 23.9866 2.23223 23.5178C1.76339 23.0489 1.5 22.413 1.5 21.75V4.25Z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7.75 3H10.25" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9 19.25V19.2625" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>