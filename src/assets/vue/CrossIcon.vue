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
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.26946 0.972622C1.78025 0.447593 2.60842 0.447593 3.11922 0.972622L11.0752 9.15033C11.586 9.67536 11.586 10.5266 11.0752 11.0516C10.5644 11.5767 9.73628 11.5767 9.22549 11.0516L1.26946 2.87392C0.758658 2.34889 0.758658 1.49765 1.26946 0.972622Z" :fill="colour"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.92488 11.0297C0.414083 10.5046 0.414083 9.65339 0.92488 9.12836L8.88091 0.950657C9.39171 0.425627 10.2199 0.425627 10.7307 0.950657C11.2415 1.47569 11.2415 2.32693 10.7307 2.85196L2.77464 11.0297C2.26384 11.5547 1.43568 11.5547 0.92488 11.0297Z" :fill="colour"/>
  </svg>
</template>
