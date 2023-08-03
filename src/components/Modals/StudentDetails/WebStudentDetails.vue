<script setup lang="ts">
import { useClassroomStore } from "@/stores/classroomStore";
import { computed, onMounted, ref} from "vue";
import type { WebFollower, Tab } from "@/models";
import type { PropType } from 'vue'
import * as REQUESTS from "@/constants/_requests";
import Tooltip from "@/components/Buttons/Tooltip.vue";
import TrashIcon from "@/assets/vue/TrashIcon.vue";
import EyeMonitorIcon from "@/assets/vue/EyeMonitorIcon.vue";
import PromoteIcon from "@/assets/vue/PromoteIcon.vue";
import MuteIcon from "@/assets/vue/MuteIcon.vue";
import UnmuteIcon from "@/assets/vue/UnmuteIcon.vue";

const emit = defineEmits<{
  (e: 'screenMonitor'): void
  (e: 'close'): void
}>()

const classroomPinia = useClassroomStore();

const props = defineProps({
  follower: {
    type: Object as PropType<WebFollower>,
    required: true,
  },
  searchQuery: {
    type: String,
    default: ''
  }
});

const filteredTabs = computed(() => {
  if (props.searchQuery?.trim() === '') {
    return props.follower.tabs;
  }

  return props.follower.tabs.filter((item: Tab) => {
    return item.url.toLowerCase().includes(props.searchQuery?.toLowerCase())
  });
});

const orderedItems = computed(() => {
  return [...filteredTabs.value].sort((a, b) => (b.lastActivated ?? 0) - (a.lastActivated ?? 0));
});

const viewScreen = () => {
  //Close the Student Detail modal
  emit('close');

  //Open the screen monitor modal
  emit('screenMonitor');
}

//Track the currently selected tab
const selectedTabId = ref("0");
const selectedTab = computed(() => {
  if(props.follower.tabs.length === 0) {
    selectedTabId.value = "-1";
    return null;
  }

  let tab = props.follower.tabs.find(res => res.id === selectedTabId.value);

  if(tab === undefined) {
    selectedTabId.value = props.follower.tabs[0].id;
    return props.follower.tabs[0];
  } else {
    return tab;
  }
})

function deleteFollowerTab(tabId: string) {
  classroomPinia.requestDeleteFollowerTab(props.follower.getUniqueId(), tabId)
}

function muteOrUnmuteTab(tabId: string, action: boolean) {
  console.log('heard a mute request', action)
  classroomPinia.requestUpdateMutingTab(props.follower.getUniqueId(), tabId, action)
}

const changeActiveTab = (tab: Tab) => {
  classroomPinia.requestActiveMedia(
      props.follower.getUniqueId(),
      { type: REQUESTS.FORCEACTIVETAB, tab: tab},
      REQUESTS.WEB
  );
}

/**
 * Check if the lastActivated website is within the tasks array. The task array is populated when a teacher pushes
 * out a website.
 * @param website A string representing the URL of the currently active website for a follower.
 */
const checkWebsite = (website: string) => {
  let tasks = classroomPinia.webTasks;
  if(tasks.length === 0) { return; }

  let strict = true; //determine if website needs to be exact or just same hostname

  const { hostname } = new URL(website); //Extract the hostname for non-strict monitoring
  return !tasks.some((res) => (strict ? website.includes(res.toString()) : res.includes(hostname)));
}

onMounted(() => {
  if(props.follower.tabs.length > 0) {
    selectedTabId.value = props.follower.tabs[0].id;
  }
});
</script>

<template>
  <div class="mx-4 flex flex-col">
    <!--The assistant page is present but not counted (No Tabs)-->
    <div v-if="follower?.tabs?.length === 0" class="py-1 flex flex-row w-full px-5 items-center justify-between">
      <div class="w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap">
        <img class="flex-shrink-0 w-5 h-5 mr-2" src="/src/assets/img/icon-128.png" alt=""/>
        <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">No open tabs...</span>
      </div>
    </div>

    <!--Active Tab-->
    <div v-else>
      <div class="flex items-center bg-white h-12 px-5 rounded-2xl mb-4">
        <div class="h-9 px-5 flex flex-row items-center justify-between w-full whitespace-nowrap overflow-hidden rounded-2xl">

          <div class="flex overflow-hidden items-center">
            <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" :src="orderedItems[0].getFavicon()" alt=""/>

            <!--Tab name and domain-->
            <div class="flex flex-row flex-shrink overflow-hidden items-center mt-0.5 pr-6">
              <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden font-medium">
                {{ orderedItems[0].getCleanTabName() }}
              </span>
              <span class="ml-2 text-sm text-gray-500 font-normal">
                {{orderedItems[0].getDomainFromLink()}}
              </span>
            </div>
          </div>

          <div class="flex flex-row items-center">
            <div class="mr-2 text-sm text-gray-500 font-semibold">
              ACTIVE TAB
            </div>

            <EyeMonitorIcon v-on:click="viewScreen" class="h-6 cursor-pointer" :colour="'#959EAF'"/>
          </div>

          <Transition name="icon">
            <div v-if="checkWebsite(orderedItems[0].url) && !selectedTab?.closing" class="has-tooltip">
              <Tooltip :tip="'Not in task list'" :toolTipMargin="'-ml-1'" :arrow-margin="'ml-1'" />
              <img
                  class="w-6 h-6 mr-2 cursor-pointer"
                  src="/src/assets/img/student-icon-alert.svg"
                  alt="alert icon"
              />
            </div>
          </Transition>
        </div>
      </div>

      <!--Tab list-->
      <div class="bg-white rounded-2xl h-[28rem] overflow-y-auto overflow-x-hidden">
        <div class="py-4 px-10 text-sm text-gray-500 font-semibold">OPEN TABS</div>

        <transition-group name="list" tag="div">
          <div v-for="(tab) in orderedItems" :key="tab.id" class="py-1" :id="tab.id">

            <!--Individual tabs-->
            <div class="flex flex-row w-full px-5 items-center justify-between">
              <div :class="{
                        'w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap': true,
                        'overflow-hidden rounded-2xl cursor-pointer': true,
                        'hover:bg-opacity-50 hover:bg-gray-300': selectedTab?.id !== tab.id,
                        'bg-blue-100': selectedTab?.id === tab.id,
                        }"
                   @click="selectedTabId = tab.id"
              >

                <div class="flex overflow-hidden items-center">
                  <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" :src="tab.getFavicon()" alt=""/>

                  <!--Tab name and domain-->
                  <div class="flex flex-row flex-shrink overflow-hidden items-center mt-0.5 pr-6">
                    <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden font-medium">
                      {{ tab.getCleanTabName() }}
                    </span>
                    <span class="ml-2 text-sm text-gray-500 font-normal">
                      {{ tab.getDomainFromLink()}}
                    </span>
                  </div>
                </div>

                <!--Action icons-->
                <div class="flex flex-shrink-0 flex-[1_1_auto] justify-end">
                  <div class="h-4 flex flex-row justify-center items-center">
                    <Transition name="icon">
                      <div v-if="tab.audible && !selectedTab?.closing" :class="{'pulse-icon': !tab.muted}">
                        <div v-if="tab.muting" class="pt-1 mr-1 lds-dual-ring" />
                        <MuteIcon v-else-if="tab.muted" v-on:click="muteOrUnmuteTab(tab.id, false)" :colour="'gray'"/>
                        <UnmuteIcon v-else v-on:click="muteOrUnmuteTab(tab.id, true)" class="h-5" :colour="'#3B82F6'"/>
                      </div>
                    </Transition>

                    <PromoteIcon v-if="selectedTabId === tab.id && orderedItems[0].id !== tab.id" v-on:click="changeActiveTab(tab)" class="ml-1" :colour="'gray'"/>
                    <TrashIcon v-if="selectedTabId === tab.id" v-on:click="deleteFollowerTab(tab.id)" class="ml-1" :colour="'gray'"/>
                  </div>
                </div>

                <Transition name="icon">
                  <div v-if="checkWebsite(tab.url) && !selectedTab?.closing" class="has-tooltip">
                    <Tooltip :tip="'Not in task list'" :toolTipMargin="'-ml-1'" :arrow-margin="'ml-1'" />
                    <img
                        class="w-6 h-6 mr-2 cursor-pointer"
                        src="/src/assets/img/student-icon-alert.svg"
                        alt="alert icon"
                    />
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>
