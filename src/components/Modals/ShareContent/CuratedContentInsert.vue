<script setup lang="ts">
import {computed, ref, watch} from "vue";
import type { Ref } from "vue";
import WebGridItem from "../../Classroom/ClassControl/GridItem/Web/WebGridItem.vue";
import MobileGridItem from "../../Classroom/ClassControl/GridItem/Mobile/MobileGridItem.vue";
import Modal from "../Modal.vue";
import {CuratedContentItem, MobileFollower, Task, WebFollower} from "@/models";
import GenericButton from "../../Buttons/GenericButton.vue";
import {useClassroomStore} from "@/stores/classroomStore";
import * as REQUESTS from "@/constants/_requests";
import CuratedContentDescription from "@/components/CuratedContent/CuratedContentDescription.vue";
import ContentFilter from "@/components/CuratedContent/ContentFilter.vue";
import CuratedContentListItem from "@/components/CuratedContent/CuratedContentListItem.vue";
import {storeToRefs} from "pinia";

defineEmits<{
  (e: 'back'): void
}>()

const classroomPinia = useClassroomStore();
const showModal = ref(false);
const shareType = ref("web");
const shareTo = ref("all");
const viewDescription = ref("");
const followersSelected: Ref<string[]> = ref([]);
const submissionAttempted = ref(false);
const yearQuery = ref('R-12');
const searchQuery = ref('');
const subjectQuery = ref("");
const topicQuery = ref("");
const showFilter = ref(false);
const error = ref();
const { webFollowers, mobileFollowers } = storeToRefs(classroomPinia)

const sortedWebFollowers = computed((): Array<WebFollower> => {
  return webFollowers.value.slice().sort((a: WebFollower, b: WebFollower) => {
    return a.name.localeCompare(b.name)
  });
});

const sortedMobileFollowers = computed((): Array<MobileFollower> => {
  return mobileFollowers.value.slice().sort((a: MobileFollower, b: MobileFollower) => {
    return a.name.localeCompare(b.name)
  });
});

/**
 * Sort and filter the results as per the search, subject or topic queries.
 */
const sortedCuratedContent = computed((): Array<CuratedContentItem> => {
  const shouldFilter = searchQuery.value !== '' || yearQuery.value !== '' || subjectQuery.value !== '' || topicQuery.value !== '';

  const filteredContent = classroomPinia.curatedContent.filter((item) => {
    const title = item.getTitle().toLocaleLowerCase();
    const years = item.getYears();
    const subjects = item.getSubjects();
    const topics = item.getTopics();

    //Filter out the results and only show them if they are classified as Live.
    return (
        item.getLive() === "YES" &&
        (!shouldFilter || title.includes(searchQuery.value.toLocaleLowerCase())) &&
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
  return sortedCuratedContent.value.find(item => item.getLink() === viewDescription.value);
});

const handleFollowerSelection = (UUID: string, value: boolean) => {
  resetErrorMessage();

  let index = followersSelected.value.findIndex(element => element === UUID)
  if (value) {
    if (index === -1) {
      followersSelected.value.splice(0, 0, UUID)
    }
  } else {
    if (index !== -1) {
      followersSelected.value.splice(index, 1)
    }
  }
}

const validateAndSubmit = async () => {
  resetErrorMessage();

  submissionAttempted.value = true
  if (shareTo.value === "selected" && followersSelected.value.length === 0) {
    error.value = "Please select a user to share this link to";
    return;
  }

  if(selectedItems.value.length === 0) {
    error.value = "Please select at least one link to share";
    return;
  }

  //Check if looking at a single link at the time
  if(viewDescription.value !== '') {
    const item: CuratedContentItem | undefined = sortedCuratedContent.value.find(item => item.getLink() === viewDescription.value);
    if(item !== undefined) {
      selectedItems.value[0] = new Task(item.getTitle(), item.getLink(), item.getType());
    }
  }

  submit();
}

const submit = () => {
  selectedItems.value.length === 1 ? singleItem() : multiItem();
  closeModal();
}

/**
 * Launch a single curated item to either the selected followers or to all connected users.
 */
const singleItem = () => {
  const isWebShare = shareType.value === "web";
  const actionType = (selectedItems.value[0].getType() === "LINK" || isWebShare) ? REQUESTS.WEBSITE : REQUESTS.FORCEACTIVEVIDEOLINK;
  const requestAction = isWebShare ? REQUESTS.WEBSITE : REQUESTS.MOBILE;
  const action = selectedItems.value[0].getPackageName();

  if (shareTo.value === 'all') {
    classroomPinia.requestAction({ type: actionType, action }, requestAction);
  } else if (shareTo.value === 'selected') {
    const followers = followersSelected.value;
    followers.forEach((id) => {
      classroomPinia.requestIndividualAction(id, { type: actionType, action }, requestAction);
    });
  }
}

/**
 * Send multiple curated items to either the selected followers or to all connected users. This will update the
 * tasks array in firebase for each of the associated followers.
 */
const multiItem = () => {
  sortedMobileFollowers.value.forEach(follower => {
    if (shareTo.value === 'all' || followersSelected.value.includes(follower.getUniqueId())) {
      follower.tasks = Array.from(new Set(follower.tasks.concat(selectedItems.value)));
      classroomPinia.updateFollowerTasks(follower.getUniqueId(), follower.tasks.map(app => app.toStringEntry()), REQUESTS.MOBILE);
    }
  });
}

const clearTaskList = () => {
  const followers = shareTo.value === 'selected'
      ? sortedMobileFollowers.value.filter(follower => followersSelected.value.includes(follower.getUniqueId()))
      : sortedMobileFollowers.value;

  followers.forEach(follower => {
    follower.clearTasks();
    classroomPinia.updateFollowerTasks(follower.getUniqueId(), [], REQUESTS.MOBILE);
  });
}

/**
 * Watch for changes in the shareType as web only allows 1 item to be pushed out whilst mobile can have 1 or more.
 */
watch(shareType, (newValue) => {
  // Clear any selected tasks as web can only handle 1
  if(newValue === "web") {
    selectedItems.value = [];
  }
});

//Track the currently selected application
const selectedItems: Ref<Task[]> = ref([])
const addOrRemoveItem = (contentItem: CuratedContentItem) => {
  resetErrorMessage();

  // Convert back to CuratedContentItem using type assertion
  const curatedContentItem: CuratedContentItem = contentItem as CuratedContentItem;
  const index = selectedItems.value.findIndex(app => app.getPackageName() === curatedContentItem.getLink());

  if (index > -1) {
    selectedItems.value.splice(index, 1);
  } else {
    const task = new Task(curatedContentItem.getTitle(), curatedContentItem.getLink(), curatedContentItem.getType());

    if(shareType.value === "web") {
      selectedItems.value[0] = task;
    } else {
      selectedItems.value.push(task);
    }
  }
}

/**
 * Share everything that it currently viewable in the list (after search/filters are applied)
 */
const shareCurrentList = () => {
  if (shareTo.value === "selected" && followersSelected.value.length === 0) {
    error.value = "Please select a user to share this list to";
    return;
  }

  if(sortedCuratedContent.value.length === 0) {
    error.value = "There are no curated content items matching your criteria";
    return;
  }

  sortedCuratedContent.value.forEach(item => {
    selectedItems.value.push(new Task(item.getTitle(), item.getLink(), item.getType()));
  });

  submit();
}

const closeModal = () => {
  shareTo.value = "all";
  followersSelected.value = [];
  showModal.value = false
  submissionAttempted.value = false
}

const resetErrorMessage = () => {
  error.value = undefined;
}

const updateYear = (data: string) => {
  yearQuery.value = data;
}

const updateSubject = (data: string) => {
  subjectQuery.value = data;
}

const updateTopic = (data: string) => {
  topicQuery.value = data;
}

const resetModal = () => {
  selectedItems.value = [];
  yearQuery.value = 'R-12';
  searchQuery.value = '';
  subjectQuery.value = "";
  topicQuery.value = "";
  showFilter.value = false;
  error.value = undefined;
}
</script>

<template>
  <header class="h-20 px-8 w-modal-width-sm bg-white flex justify-between items-center rounded-t-lg">
    <p class="text-2xl font-medium">Select content</p>

    <div class="flex flex-row items-center">
      <!--Allow a user to search via the input-->
      <div class="flex items-center w-60 mr-4">
        <label for="searchInput" class="cursor-pointer w-8 h-8 ml-1 absolute">
          <img src="/src/assets/img/search-icon.svg" alt="Search"/>
        </label>
        <input
            id="searchInput"
            v-model="searchQuery"
            placeholder="Search titles"
            class="h-12 w-60 pr-6 pl-10 rounded-lg text-black bg-gray-100"/>

        <img
            v-if="searchQuery !== ''"
            v-on:click="searchQuery = ''"
            class="w-3 h-3 relative right-5 cursor-pointer"
            src="/src/assets/img/cross.svg" alt="Search"/>
      </div>

      <!--Show the filter menu-->
      <button v-on:click="showFilter = !showFilter">
        <img src="/src/assets/icons/filter.svg">
      </button>

      <img
          v-on:click="closeModal"
          class="w-4 h-4 ml-8 cursor-pointer"
          src="/src/assets/img/modal-icon-exit.svg"
          alt="Close Icon"
      />
    </div>
  </header>

  <div class="w-modal-width-sm">
    <div v-if="viewDescription === ''" class="flex flex-col h-96">
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
          <div v-if="showFilter" @click="showFilter = false" class="absolute h-96 w-modal-width bg-gray-300 z-5 bg-opacity-70"></div>
        </Transition>
      </div>

      <!--Load in the curated content-->
      <div class="max-h-96 shrink flex flex-col overflow-y-auto">
        <!--List of curated content items-->
        <CuratedContentListItem
            v-for="(content, index) in sortedCuratedContent"
            :key="index"
            :content-item="content"
            :selected="selectedItems.findIndex(item => item.getPackageName() === content.getLink()) !== -1"
            @select="addOrRemoveItem(content)">
        </CuratedContentListItem>
      </div>
    </div>

    <div class="mx-14 mt-8 h-20 bg-white flex items-center justify-between">
      <p class="ml-8 text-lg font-medium mr-2">Share to</p>
      <div class="flex justify-start">
        <label class="mr-4 lg:mr-14 flex justify-between items-center">
          <input class="h-5 w-5 mr-4" name="shareType" type="radio" v-model="shareType" value="web">
          <span class="text-base">Web users</span>
        </label>

        <label class="flex justify-between items-center mr-8 lg:mr-20">
          <input class="h-5 w-5 mr-4" name="shareType" type="radio" v-model="shareType" value="mobile">
          <span class="text-base">Mobile users</span>
        </label>
      </div>

      <div class="flex justify-start">
        <label class="mr-4 lg:mr-14 flex justify-between items-center">
          <input class="h-5 w-5 mr-4" name="shareTo" type="radio" v-model="shareTo" value="all">
          <span class="text-base">All connected users</span>
        </label>

        <label class="flex justify-between items-center mr-8 lg:mr-20">
          <input class="h-5 w-5 mr-4" name="shareTo" type="radio" v-model="shareTo" value="selected">
          <span class="text-base">Select users</span>
        </label>
      </div>
    </div>
  </div>

  <div class="w-modal-width-sm max-h-64 overflow-y-auto">
    <!--Web followers-->
    <div v-if="shareTo === 'selected' && shareType === 'web' && webFollowers.length"
         class="mt-4 flex flex-row flex-wrap ml-10 mr-14">
      <WebGridItem
          v-for="follower in sortedWebFollowers"
          :key="follower.getUniqueId()"
          class="pl-4 pt-4 w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
          :webFollower="follower"
          :controls="false"
          @update="(value: boolean) => { handleFollowerSelection(follower.getUniqueId(), value) }"/>
    </div>

    <!--Mobile followers-->
    <div v-else-if="shareTo === 'selected' && shareType === 'mobile' && mobileFollowers.length"
         class="mt-4 flex flex-row flex-wrap ml-10 mr-14">
      <MobileGridItem
          v-for="follower in sortedMobileFollowers"
          :key="follower.getUniqueId()"
          class="pl-4 pt-4 w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/6"
          :mobileFollower="follower"
          :controls="false"
          @update="(value: boolean) => { handleFollowerSelection(follower.getUniqueId(), value) }"/>
    </div>

    <!--No followers-->
    <div class="flex justify-center items-center bg-gray-200 mx-14 mt-4 px-5 py-5" v-else-if="shareTo === 'selected'">
      <span>No students connected</span>
    </div>
  </div>


  <footer class="mt-11 mb-8 mx-14 text-right flex flex-row justify-between">
    <!--Clear any tasks the mobile users may already have-->
    <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default font-medium"
            :class="{'invisible': shareType === 'web'}"
            v-on:click="clearTaskList"
    >Clear tasks</button>

    <div class="flex flex-row">
      <button class="w-36 h-11 mr-4 text-blue-500 text-base rounded-lg hover:bg-gray-default font-medium"
              v-on:click="$emit('back');"
      >Back</button>
      <div class="relative">
        <div
            v-if="error !== undefined"
            class="absolute bottom-12 min-w-max right-0 rounded shadow-lg
            px-3 py-1 rounded-xl bg-white text-black border-gray-600
            border-1 flex flex-row items-center mb-2">
          <img
              class="w-5 h-5 mr-2"
              src="/src/assets/img/student-icon-alert.svg"
              alt="alert icon"
          />
          <span>{{error}}</span>
        </div>

        <GenericButton
            class="w-52 h-12 text-white bg-blue-500 rounded-lg text-base hover:bg-blue-400 font-medium"
            :class="{'mr-4': shareType === 'mobile' && viewDescription === ''}"
            :callback="validateAndSubmit"
        >{{ selectedItems.length > 1 && viewDescription === '' ? 'Add to tasks' : 'Share link' }}</GenericButton>

        <GenericButton
            v-if="shareType === 'mobile' && viewDescription === ''"
            class="w-52 h-12 text-white bg-blue-500 rounded-lg text-base hover:bg-blue-400 font-medium"
            :callback="shareCurrentList"
        >Share list</GenericButton>
      </div>
    </div>
  </footer>
</template>

<style>
.fading-enter-active,
.fading-leave-active {
  transition: opacity 0.5s ease;
}

.fading-enter-to,
.fading-leave-from {
  opacity: 100%;
}

.fading-enter-from,
.fading-leave-to {
  opacity: 0;
}
</style>
