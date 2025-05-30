<script setup lang="ts">
import type { CuratedContentItem } from "@/models";
import type { PropType } from "vue";
import {computed, onMounted, ref} from "vue";
import CheckboxInput from "@/components/InputFields/CheckboxInput.vue";
import { useClassroomStore } from "@/stores/classroomStore";
const classroomPinia = useClassroomStore();
const emit = defineEmits<{
  (e: 'select'): void
  (e: 'viewDescription', value: string): void
}>()

const props = defineProps({
  contentItem: {
    type: Object as PropType<CuratedContentItem>,
    required: true
  },
  selected: {
    type: Boolean,
    required: true
  }
})

const selectionToggled = () => {
  emit('select');
}

/**
 * Make sure the Years are evenly spaces I.e. (5, 6, 7) not (5,6,7)
 */
const yearSpace = computed(() => {
  return props.contentItem.getYears().split(',').join(', ')
});

const imageLink = ref("")

onMounted(() => {
  classroomPinia.getCuratedContentImageUrl(props.contentItem.getLink()).then(result => {
    imageLink.value = result
  })
})

</script>

<template>
  <div v-if="contentItem !== undefined" class="flex flex-col px-2 py-2">
    <div class="flex flex-col rounded-xl w-full"
      :class="{
        'bg-blue-200 p-3.5 border-2 border-blue-500': selected,
        'bg-white p-4': !selected
      }"
    >
      <div class="mb-2 flex flex-row items-center justify-between">
        <!--Title-->
        <span
          class="text-lg font-semibold truncate"
          :class="{
            'text-blue-500': selected
          }"
        >{{ contentItem.getTitle() }}</span>

        <!--Select Checkbox-->
        <CheckboxInput :checked="selected" @on-change="selectionToggled" />
      </div>

      <div class="flex flex-row">
        <!--Thumbnail preview-->
        <div class="flex flex-col w-1/3">
          <img v-if="imageLink && imageLink !== ''" class="h-32 rounded-xl mr-2 object-cover" :src="imageLink" alt="Image"/>
          <div v-else class="h-32 rounded-xl mr-2 c-animated-background"/>
        </div>

        <div class="flex flex-col w-2/3">
          <!--Description-->
          <div :class="{
              'flex flex-col h-[100px] mb-2 rounded-lg text-gray-600 text-sm relative': true,
              'bg-blue-100': selected,
              'bg-gray-200': !selected
            }"
          >
            <div class="flex grow p-2 h-16">
              <span class="line-clamp-3">{{ contentItem.getDescription() }}</span>
            </div>

            <!--Go to details popout-->
            <div class="flex flex-row justify-end text-gray-400 w-full h-6 pr-2">
              <div class="cursor-pointer w-auto" v-on:click="$emit('viewDescription', contentItem.getTitle())">
                See More
              </div>
            </div>
          </div>

          <!--Details-->
          <div class="flex flex-row justify-end">
            <!--Subjects-->
            <div class="flex flex-row" v-if="contentItem.getSubjects() !== ''">
              <div v-for="(content, index) in contentItem.getSubjects().split(',')"
                 :key="index"
                 :class="{
                  'h-6 w-max-24 flex items-center px-2 mr-2 rounded-3xl text-sm text-gray-600': true,
                  'bg-blue-100': selected,
                  'bg-gray-200': !selected
                }"
              >
                <span class="truncate capitalize">{{ content }}</span>
              </div>
            </div>

            <!--Years-->
            <div v-if="contentItem.getYears() !== ''"
                 class="h-6 max-w-[115px] flex items-center px-2 mr-2 rounded-3xl text-sm text-white bg-blue-500"
            >
              <span class="mr-1">Year:</span>
              <span class="truncate">{{ yearSpace }}</span>
            </div>

            <!--Topics-->
            <div v-if="contentItem.getTopics() !== ''"
                 class="h-6 max-w-[115px] flex items-center px-2 rounded-3xl text-sm text-white bg-navy-side-menu">
              <span class="truncate capitalize">{{ contentItem.getTopics() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes placeHolderShimmer {
  0%   { background-position:  100%; }
  100% { background-position: -100%; }
}

.c-animated-background {
  animation: 3s linear infinite placeHolderShimmer;
  background: linear-gradient(to right, #e2e8f0 0%, #cbd5e1 8%, #e2e8f0 16%, #e2e8f0 50%, #cbd5e1 58%, #e2e8f0 66%);
  background-size: 200%;
  height: 100%;
}
</style>