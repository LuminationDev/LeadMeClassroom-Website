<script setup lang="ts">
import type { CuratedContentItem } from "@/models";
import type { PropType } from "vue";

defineEmits<{
  (e: 'select'): void
}>()

defineProps({
  contentItem: {
    type: Object as PropType<CuratedContentItem>,
    required: true
  },
  selected: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <div v-if="contentItem !== undefined" class="flex flex-col px-10 py-3">
    <div class="relative">
      <a class="absolute top-5 right-0 w-10 h-10" :href="contentItem.getLink()" target="_blank">
        <img src="/src/assets/icons/open-link.svg"/>
      </a>
    </div>
    <div class="flex flex-col rounded-xl p-5 w-full" :class="selected ? 'bg-gray-200' : 'bg-white'" @click="$emit('select')">
      <div>
        <input type="checkbox" class="mr-2" :checked="selected"><span class="text-lg font-semibold">{{ contentItem.getTitle() }}</span>
      </div>
      <span class="line-clamp-2">{{ contentItem.getDescription() }}</span>
      <div class="grid grid-cols-3">
        <div>
          <span class="font-semibold">Years: </span>{{ contentItem.getYears() }}
        </div>
        <div>
          <span class="font-semibold">Subjects: </span>{{ contentItem.getSubjects() }}
        </div>
        <div>
          <span class="font-semibold">Topics: </span>{{ contentItem.getTopics() }}
        </div>
      </div>
    </div>
  </div>
</template>
