<script setup lang="ts">
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import { computed } from "vue";
import ActionBarSelect from "@/components/ActionBar/ActionBarSelect.vue";
import {Application} from "@/models";

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

  const apps = classroomPinia.collectUniqueApplications();
  if(apps === undefined) return;

  // Assuming `videos` is an array containing all the videos
  for (const app of apps) {
    const name = app.getPackageName();
    missingCounts[name] = calculateMissing(name);
  }

  return missingCounts;
});

const calculateMissing = (packageName: string) => {
  return classroomPinia.mobileFollowers.reduce((count, follower) => {
    const filteredArray = follower.applications.filter(obj => obj.packageName === packageName);

    if (filteredArray.length === 0) {
      count++;
    }

    return count;
  }, 0);
}

const filteredApplications = computed(() => {
  if (props.searchQuery?.trim() === '') {
    return classroomPinia.collectUniqueApplications();
  }

  return classroomPinia.collectUniqueApplications()?.filter((item: Application) => {
    return item.name.toLowerCase().includes(props.searchQuery?.toLowerCase())
  });
});
</script>

<template>
  <div class="bg-gray-300">
    <div class="flex flex-col h-96 mx-5 pt-2 overflow-y-auto bg-white rounded-lg">
      <div v-for="(application, index) in filteredApplications" :key="index" class="py-1" :id="application.id">

        <!--Select applications-->
        <div class="flex flex-row w-full px-3 items-center justify-between">
          <div :class="{
                'w-full h-9 px-5 flex flex-row items-center justify-between overflow-ellipsis whitespace-nowrap': true,
                'overflow-hidden rounded-3xl cursor-pointer': true,
                'hover:bg-opacity-50 hover:bg-gray-300': actionPinia.selectedItems.findIndex(app => app.getPackageName() === application.id) === -1,
                'hover:bg-opacity-50 bg-blue-100': actionPinia.selectedItems.findIndex(app => app.getPackageName() === application.id) !== -1,
                }"
               @click="actionPinia.addOrRemoveApplication(application)"
          >
            <div class="flex flex-row items-center">
              <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" :src="classroomPinia.firebase.getAppIcon(application.packageName) ?? undefined" alt=""/>
              <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5 font-semibold">
                {{ application.getName() }}
              </span>
            </div>

            <div class="text-sm text-gray-500" >
              <span v-if="missingCounts[application.getPackageName()] > 0">
                missing on {{ missingCounts[application.getPackageName()] }} device<span v-if="missingCounts[application.getPackageName()] > 1">s</span>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!--Action bar for selecting followers-->
  <div class="px-5 py-3 bg-gray-300">
    <ActionBarSelect share-type="app"/>
  </div>
</template>
