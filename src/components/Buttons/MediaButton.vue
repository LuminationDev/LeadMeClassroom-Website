<script setup lang="ts">
import type { PropType } from "vue";
import type { MobileFollower } from "@/models";
import HoverButton from "./HoverButton.vue";

defineProps({
  mobileFollower: {
    type: Object as PropType<MobileFollower>,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  requested: {
    type: String,
    required: true,
  },
  imageSrc: {
    type: String,
    required: true,
  },
  inactiveImageSrc: {
    type: String,
    required: true,
  },
  actionValue: {
    type: String,
    required: true,
  },
  sendAction: {
    type: Function as PropType<(arg: any[]) => void>,
    required: true
  }
})
</script>

<template>
  <div class="h-10 w-10 flex flex-row justify-center items-center">
    <div v-if="loading && requested === actionValue" class="lds-dual-ring" />

    <HoverButton v-else class="h-10 w-10" v-on:click="sendAction">
      <template v-slot:original>
        <img v-if="mobileFollower.action === actionValue" class="h-full w-full" :src="imageSrc" :alt="actionValue"/>
        <img v-else class="h-full w-full" :src="inactiveImageSrc"  alt="Play"/>
      </template>
      <template v-slot:hover>
        <img class="h-full w-full" :src="imageSrc" :alt="actionValue"/>
      </template>
    </HoverButton>
  </div>
</template>
