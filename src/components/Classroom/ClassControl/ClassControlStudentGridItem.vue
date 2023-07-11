<script setup lang="ts">
import {computed, defineProps, ref} from 'vue'
import type {PropType} from 'vue'
import WebFollowerIcon from "@/assets/WebFollowerIcon.vue";
import MobileFollowerIcon from "@/assets/MobileFollowerIcon.vue";
import {Follower} from "@/models";
import EllipsisIcon from "@/assets/EllipsisIcon.vue";
import CheckboxInput from "@/components/InputFields/CheckboxInput.vue";
import {useClassroomStore} from "@/stores/classroomStore";

const classroomPinia = useClassroomStore();

const emit = defineEmits<{
  (e: 'selectionToggled', value: boolean): void
}>()

function selectionToggled() {
  emit('selectionToggled', !props.selected);
}

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
  selected: {
    type: Boolean,
    required: true
  },
  controls: {
    type: Boolean,
    required: false,
    default: true
  }
});

const taskName = computed(() => {
  return props.follower.activeTaskName
})

const iconUrl = computed(() => {
  return props.follower.activeTaskIconUrl
})

</script>

<template>
  <div class="w-64 transition-all duration-500 ease-in-out">
    <div class="h-34 flex flex-col rounded-lg p-4"
      :class="{
        'bg-zinc-200 border-2 border-solid border-zinc-200': !selected,
        'border-2 border-solid border-blue-500 bg-blue-200': selected
      }">
      <div class="flex flex-row justify-between">
        <span class="text-lg font-medium" :class="{
        'text-blue-500': selected
      }">{{ follower.name }}</span>
        <div class="flex flex-row">
          <WebFollowerIcon v-if="follower.type === 'web'" class="h-6 w-6 mr-2" :colour="selected ? '#3B82F6' : '#BDC3D6'" />
          <MobileFollowerIcon v-else-if="follower.type === 'mobile'" class="h-6 w-6 mr-2" :colour="selected ? '#3B82F6' : '#BDC3D6'" />
          <CheckboxInput :checked="selected" @on-change="selectionToggled" />
        </div>
      </div>
      <div class="rounded-full text-gray-500 my-4" :class="{
        'bg-blue-100': selected,
        'bg-white': !selected
      }">
        <div class="flex flex-row items-center py-2 px-4 font-medium">
          <img v-if="iconUrl" class="flex-shrink-0 w-4 h-4 mr-2" :src="iconUrl"  alt=""/>
          <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">{{ taskName }}</span>
        </div>
      </div>
      <div class="flex flex-row justify-end">
        <EllipsisIcon :colour="selected ? '#3B82F6' : '#BDC3D6'"/>
      </div>
    </div>
  </div>
</template>
