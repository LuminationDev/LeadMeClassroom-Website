<script setup lang="ts">
import { CuratedContentItem } from "@/models";
import { PropType } from "vue";

defineEmits<{
  (e: 'return'): void
}>()

defineProps({
  contentItem: {
    type: Object as PropType<CuratedContentItem>,
    required: true
  }
})
</script>

<template>
  <div v-if="contentItem !== undefined" class="flex flex-col px-10 py-3">

    <!--Title and back button-->
    <div class="flex flex-row justify-end">
      <img class="flex-shrink-0 w-5 h-5 cursor-pointer" src="src/assets/img/options-back.svg" alt=""
           @click="$emit('return')"/>
    </div>

    <!--Description and information-->
    <div class="flex flex-col [&>*]:my-4">
      <div>
        <span class="font-bold">Title: </span> {{contentItem.getTitle()}}
      </div>
      <div>
        <span class="font-bold">Description: </span> {{contentItem.getDescription()}}
      </div>
      <div>
        <span class="font-bold">Link: </span> {{contentItem.getLink()}}
      </div>
      <div>
        <span class="font-bold">Years: </span> {{contentItem.getYears()}}
      </div>
      <div>
        <span class="font-bold">Subjects: </span> {{contentItem.getSubjects()}}
      </div>
      <div>
        <span class="font-bold">Topics: </span> {{contentItem.getTopics()}}
      </div>
    </div>
  </div>
</template>
