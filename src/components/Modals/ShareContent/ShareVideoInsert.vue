<script setup lang="ts">
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import { computed } from "vue";
import ActionBarSelect from "@/components/ActionBar/ActionBarSelect.vue";
import type { Video } from "@/models";

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();

const props = defineProps({
  searchQuery: {
    type: String,
    default: ''
  }
});

const missingCounts = computed(() => {
  const missingCounts: Record<string, number> = {};

  const videos = classroomPinia.collectUniqueVideos();
  if(videos === undefined) return;

  // Assuming `videos` is an array containing all the videos
  for (const video of videos) {
    const name = video.getName();
    missingCounts[name] = calculateMissing(name);
  }

  return missingCounts;
});

const calculateMissing = (name: string) => {
  return classroomPinia.mobileFollowers.reduce((count, follower) => {
    const filteredArray = follower.videos.filter(obj => obj.name === name);

    if (filteredArray.length === 0) {
      count++;
    }

    return count;
  }, 0);
}

const filteredVideos = computed(() => {
  if (props.searchQuery?.trim() === '') {
    return classroomPinia.collectUniqueVideos();
  }

  return classroomPinia.collectUniqueVideos()?.filter((item: Video) => {
    return item.name.toLowerCase().includes(props.searchQuery?.toLowerCase())
  });
});
</script>

<template>
  <div class="bg-gray-300">
    <div class="flex flex-col h-96 mx-5 pt-2 overflow-y-auto bg-white rounded-lg">
      <div v-for="(video, index) in filteredVideos" :key="index" class="py-1" :id="video.id">

        <!--Select applications-->
        <div class="flex flex-row w-full px-3 items-center justify-between">
          <div :class="{
                'w-full h-9 px-5 flex flex-row items-center justify-between overflow-ellipsis whitespace-nowrap': true,
                'overflow-hidden rounded-3xl cursor-pointer': true,
                'hover:bg-opacity-50 hover:bg-gray-300': actionPinia.selectedItems.findIndex(app => app.getPackageName() === video.id) === -1,
                'hover:bg-opacity-50 bg-blue-100': actionPinia.selectedItems.findIndex(app => app.getPackageName() === video.id) !== -1,
                }"
               @click="actionPinia.addOrRemoveVideo(video)"
          >
            <div class="flex flex-row items-center">
              <span
                  :class="{
                    'flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5 font-semibold': true,
                    'text-blue-500': actionPinia.selectedItems.findIndex(app => app.getPackageName() === video.id) !== -1
                  }"
              >{{ video.getName().replace(/\.[^/.]+$/, "") }}</span>
            </div>

            <div class="text-sm text-gray-500" >
              <span v-if="missingCounts && missingCounts[video.getName()] > 0">
                missing on {{ missingCounts[video.getName()] }} device<span v-if="missingCounts[video.getName()] > 1">s</span>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!--Action bar for selecting followers-->
  <div class="px-5 py-3 bg-gray-300">
    <ActionBarSelect share-type="video"/>
  </div>
</template>
