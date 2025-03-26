<script setup lang="ts">
import type { CuratedContentItem } from "@/models";
import type { PropType } from "vue";
import { computed, onMounted, ref } from "vue";
import Spinner from "@/components/Buttons/Spinner.vue";

const props = defineProps({
  contentItem: {
    type: Object as PropType<CuratedContentItem>,
    required: true
  }
});

/**
 * Currently only designed for YOUTUBE links.
 */
const extractYouTubeVideoID = computed( () => {
  // Extract the video ID from the YouTube link
  const regex = /(?:\/|%3D|v=|vi=)([0-9A-Za-z_-]{11})(?:[%#?&]|$)/;
  const match = props.contentItem.getLink().match(regex);

  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }

  // If the link doesn't match the expected format, return null or handle the error accordingly
  return undefined;
})

/**
 * Make sure the Years are evenly spaces I.e. (5, 6, 7) not (5,6,7)
 */
const yearSpace = computed(() => {
  return props.contentItem.getYears().split(',').join(', ')
});

const loaded = ref(false);
const iframeRef = ref<HTMLIFrameElement | null>(null);

onMounted(() => {
  const iframe = iframeRef.value;
  if (iframe) {
    iframe.addEventListener('load', () => {
      // Perform actions after the iframe has loaded
      loaded.value = true;
    });
  }
});
</script>

<template>
  <div v-if="contentItem !== undefined" class="flex flex-col px-4 pb-2 bg-gray-300">
    <!--Video preview-->
    <div class="mb-2">
      <!--Loading spinner-->
      <div class="w-[575px] h-[315px] flex items-center justify-center" v-if="!loaded">
        <Spinner />
      </div>

      <iframe
          ref="iframeRef"
          class="rounded-lg"
          :class="{'hidden': !loaded}"
          width="575"
          height="315"
          :src="extractYouTubeVideoID"/>
    </div>

    <!--Link to the site-->
    <div class="flex flex-row justify-between h-6 mb-2">
      <div>
        <!--Details-->
        <div class="flex flex-row justify-end">
          <!--Subjects-->
          <div class="flex flex-row" v-if="contentItem.getSubjects() !== ''">
            <div v-for="(content, index) in contentItem.getSubjects().split(',')"
                 :key="index"
                 :class="{
                      'h-6 w-max-24 flex items-center px-2 mr-2 rounded-3xl text-sm text-gray-600 bg-gray-200': true,
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

      <a class="flex flex-row items-center" :href="contentItem.getLink()" target="_blank">
        <img class="mr-2 h-4" src="/src/assets/icons/open-link.svg" alt="Open"/>
        <div class="text-sm text-blue-500">
          Open in new tab
        </div>
      </a>
    </div>

    <!--Description-->
    <div class="flex flex-col h-48 mb-2 rounded-lg text-gray-600 text-sm relative bg-white">
      <div class="flex grow p-2">
        {{ contentItem.getDescription() }}
      </div>
    </div>
  </div>
</template>
