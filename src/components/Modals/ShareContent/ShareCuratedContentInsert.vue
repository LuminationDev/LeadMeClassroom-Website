<script setup lang="ts">
import { computed, ref } from "vue";
import type { CuratedContentItem } from "@/models";
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import ContentFilter from "@/components/CuratedContent/ContentFilter.vue";
import CuratedContentListItem from "@/components/CuratedContent/CuratedContentListItem.vue";
import CuratedContentDescription from "@/components/CuratedContent/CuratedContentDescription.vue";
import ActionBarSelect from "@/components/ActionBar/ActionBarSelect.vue";

const emit = defineEmits<{
  (e: 'viewItem', value: string): void
  (e: 'closeFilter'): void
}>()

const props = defineProps({
  searchQuery: {
    type: String,
    require: true
  },
  showFilter: {
    type: Boolean,
    require: true
  }
})

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();
const yearQuery = ref('R-12');
const subjectQuery = ref("");
const topicQuery = ref("");

/**
 * Sort and filter the results as per the search, subject or topic queries.
 */
const sortedCuratedContent = computed((): Array<CuratedContentItem> => {
  const shouldFilter = props.searchQuery! !== '' || yearQuery.value !== '' || subjectQuery.value !== '' || topicQuery.value !== '';

  const filteredContent = classroomPinia.curatedContent.filter((item) => {
    const title = item.getTitle().toLocaleLowerCase();
    const years = item.getYears();
    const subjects = item.getSubjects();
    const topics = item.getTopics();

    //Filter out the results and only show them if they are classified as Live.
    return (
        item.getLive() === "YES" &&
        (!shouldFilter || title.includes(props.searchQuery!.toLocaleLowerCase())) &&
        (!shouldFilter || !yearQuery.value || containsYearLevel(years)) &&
        (!shouldFilter || !subjectQuery.value || subjects?.includes(subjectQuery.value)) &&
        (!shouldFilter || !topicQuery.value || topics?.includes(topicQuery.value))
    );
  });

  return filteredContent.sort((a, b) => {
    return a.getTitle().localeCompare(b.getTitle());
  });
});

const containsYearLevel = (years: string) => {
  if (yearQuery.value === 'R-12') {
    return true;
  }

  let [start, end] = yearQuery.value.split('-').map(String);
  const reception = start === 'R' && end !== 'R';

  if (reception) {
    start = '1';
  }

  if (start && end && parseInt(start) <= parseInt(end)) {
    const yearLevels = Array.from({ length: parseInt(end) - parseInt(start) + 1 }, (_, index) => String(parseInt(start) + index));
    if (reception) {
      yearLevels.push('R');
    }

    const itemYearArray = years.split(',');
    return yearLevels.some(level => itemYearArray.includes(level));
  }

  return false;
}

const subjectList = computed(() => {
  // Extract subjects from each item and flatten the array
  let subjects = classroomPinia.curatedContent.flatMap(item => item.getSubjects().split(','));
  subjects = subjects.filter(subject => subject !== "" && subject !== "-"); //Remove the null values
  // Create a Set to store unique subject values and convert Set back to an array
  return Array.from(new Set(subjects));
});

const topicList = computed(() => {
  // Extract topics from each item and flatten the array
  let topics = classroomPinia.curatedContent.flatMap(item => item.getTopics().split(','));
  topics = topics.filter(topic => topic !== "" && topic !== "-"); //Remove the null values
  // Create a Set to store unique subject values and convert Set back to an array
  return Array.from(new Set(topics));
});

const selectedItemDescription = computed((): CuratedContentItem | undefined => {
  return sortedCuratedContent.value.find(item => item.getTitle() === actionPinia.viewDescription!);
});

const updateYear = (data: string) => {
  yearQuery.value = data;
}

const updateSubject = (data: string) => {
  subjectQuery.value = data;
}

const updateTopic = (data: string) => {
  topicQuery.value = data;
}

const viewItem = (data: string) => {
  emit('viewItem', data);
}
</script>

<template>
  <!--List of curated content-->
  <div v-if="actionPinia.viewDescription === ''" class="h-curated-content-insert bg-gray-300">
    <div class="flex flex-col h-curated-content-insert">
      <!--Show the filter area-->
      <div class="relative">
        <div class="absolute right-0 h-80 z-10 my-8 ease-in-out duration-500"
             :class="{ 'translate-x-full': !showFilter, 'translate-x-0': showFilter }">
          <ContentFilter
              :selected-Year="yearQuery"
              @yearQuery="updateYear"
              :selected-subject="subjectQuery"
              @subjectQuery="updateSubject"
              :subjects="subjectList"
              :selected-topic="topicQuery"
              @topicQuery="updateTopic"
              :topics="topicList"/>
        </div>

        <Transition name="fading">
          <div v-if="showFilter" v-on:click="$emit('closeFilter')"
               class="absolute h-curated-content-insert w-modal-width bg-gray-300 z-5 bg-opacity-70"/>
        </Transition>
      </div>

      <!--Load in the curated content-->
      <div class="grow overflow-y-auto grid grid-cols-1 2xl:grid-cols-2 gap-1 ml-3 mr-3">
        <!--List of curated content items-->
        <CuratedContentListItem
            v-for="(content, index) in sortedCuratedContent"
            :key="index"
            :content-item="content"
            :selected="actionPinia.selectedItems.findIndex(item => item.getPackageName() === content.getLink()) !== -1"
            @select="actionPinia.addOrRemoveCuratedContentItem(content)"
            @viewDescription="viewItem"/>
      </div>

      <!--Action bar for selecting followers-->
      <div class="px-5 py-3">
        <ActionBarSelect share-type="curated" />
      </div>
    </div>
  </div>

  <!--Individual curated content item-->
  <CuratedContentDescription v-else-if="selectedItemDescription" :contentItem="selectedItemDescription" />
</template>
