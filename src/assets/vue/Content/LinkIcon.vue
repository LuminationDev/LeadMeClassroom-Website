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
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.501 22.4961L22.501 13.4961" :stroke="colour" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16.499 8.99655L17.1935 8.19255C18.6002 6.78604 20.5081 5.99595 22.4973 5.99609C24.4865 5.99623 26.3943 6.78659 27.8008 8.1933C29.2073 9.60001 29.9974 11.5078 29.9972 13.4971C29.9971 15.4863 29.2067 17.394 27.8 18.8006L26.999 19.4966" :stroke="colour" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M19.5012 27.0039L18.9057 27.8049C17.4826 29.2122 15.5619 30.0015 13.5604 30.0015C11.559 30.0015 9.63832 29.2122 8.21519 27.8049C7.51372 27.1113 6.95683 26.2854 6.57676 25.3751C6.19668 24.4648 6.00098 23.4881 6.00098 22.5017C6.00098 21.5152 6.19668 20.5385 6.57676 19.6282C6.95683 18.7179 7.51372 17.892 8.21519 17.1984L9.00119 16.5039" :stroke="colour" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>
