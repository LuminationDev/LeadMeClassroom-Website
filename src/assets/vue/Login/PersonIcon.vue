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
    <path d="M10.6666 9.33333C10.6666 10.7478 11.2285 12.1044 12.2287 13.1046C13.2289 14.1048 14.5855 14.6667 16 14.6667C17.4144 14.6667 18.771 14.1048 19.7712 13.1046C20.7714 12.1044 21.3333 10.7478 21.3333 9.33333C21.3333 7.91885 20.7714 6.56229 19.7712 5.5621C18.771 4.5619 17.4144 4 16 4C14.5855 4 13.2289 4.5619 12.2287 5.5621C11.2285 6.56229 10.6666 7.91885 10.6666 9.33333Z" :stroke="colour" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M8 26.6665V23.9998C8 22.5853 8.5619 21.2288 9.5621 20.2286C10.5623 19.2284 11.9188 18.6665 13.3333 18.6665H18.6667C20.0812 18.6665 21.4377 19.2284 22.4379 20.2286C23.4381 21.2288 24 22.5853 24 23.9998V26.6665" :stroke="colour" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>
