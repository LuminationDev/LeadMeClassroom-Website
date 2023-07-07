<script setup lang="ts">
import {computed} from "vue";

const props = defineProps({
  faded: {
    type: Boolean,
    required: true,
  },
  active: {
    type: Boolean,
    required: true
  },
  solid: {
    type: Boolean,
    required: true
  },
  fadedSrc: {
    type: String,
    required: true
  },
  activeSrc: {
    type: String,
    required: true
  },
  solidSrc: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  }
});

const state = computed(() => {
  if (props.faded) {
    return props.fadedSrc;
  } else if (props.active) {
    return props.activeSrc;
  } else if (props.solid) {
    return props.solidSrc
  }

  return props.fadedSrc;
})
</script>

<template>
  <img :src="state" :alt="alt">
</template>
