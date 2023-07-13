<script setup lang="ts">
import { useClassroomStore } from "@/stores/classroomStore";
const classroomPinia = useClassroomStore();

defineProps({
  view: {
    type: String,
    required: true
  },
  panel: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    required: true
  },
  icon: {
    type: String
  }
})
</script>

<template>
  <router-link
      :class="{
        'flex menu-item rounded-lg font-light': true,
        'cursor-pointer': enabled,
        'cursor-default': !enabled,
        'bg-white-menu-overlay': classroomPinia.view === panel && enabled,
        'hover:bg-white-menu-overlay': classroomPinia.view !== panel && enabled,
      }"
    :to="view">

    <img :class="{
      'w-5 h-5 menu-item-icon': true,
      'contrast-50 brightness-75': !enabled
    }" :src="icon" alt="Icon"/>

    <p class="menu-item-text" :class="{
      'text-base': true,
      'text-white': enabled,
      'text-gray-400': !enabled
    }">
      <slot></slot>
    </p>
  </router-link>
</template>
