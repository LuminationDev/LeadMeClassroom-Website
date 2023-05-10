<script setup lang="ts">
import { computed, defineProps, PropType, ref } from "vue";
import { MobileFollower } from "../../../../../models";
import { Application } from "@/models";
import { useDashboardStore } from "@/stores/dashboardStore";
const dashboardPinia = useDashboardStore();

const emit = defineEmits<{
  (e: 'update:renaming', value: boolean): void
  (e: 'update:name', value: string): void
  (e: 'update:screenType', value: string): void
}>()

const props = defineProps({
  mobileFollower: {
    type: Object as PropType<MobileFollower>,
    required: true,
  },
  controls: {
    type: Boolean,
    required: false,
    default: true
  },
  renaming: {
    type: Boolean,
    required: false,
    default: false
  },
  name: {
    type: String,
    required: false
  },
  screenType: {
    type: String,
    required: false,
    default: 'tabs'
  }
});

/**
 * Compute the active application of a follower. Check if the active application is within the current tasks.
 */
const currentlyActiveApplication = computed((): Application | null | undefined => {
  if(!props.mobileFollower.applications) {
    return null;
  }

  if(props.mobileFollower.applications.length === 0) {
    return null;
  }

  //TODO finish this later when tasks are completed
  checkActiveTask(props.mobileFollower.currentApplication.value);

  //TODO fix this so mobileFollower.currentApplication is not a ref
  const packageName = Object.assign(props.mobileFollower.currentApplication);
  console.log(packageName);


  const app = props.mobileFollower.applications.find(res => res.id === packageName.toString());

  console.log(app);

  if(app === undefined) {
    return null;
  }

  return app;
})

/**
 * Check if the active application is within the tasks array. The task array is populated when a teacher pushes
 * out an application.
 * @param packageName A string representing the display name of the currently active application for a mobile follower.
 */
const checkActiveTask = async (packageName: string) => {
  let tasks = dashboardPinia.mobileTasks;
  if(tasks.length === 0) { return; }

  props.mobileFollower.offTask = !tasks.some((res) => (packageName.includes(res.toString())));
}

/**
 * Wait a for the field to be shown and then focus it.
 */
const inputField = ref()
const focusInput = () => {
  setTimeout(() => {inputField.value.focus()}, 100);
};

const revertInput = () => {
  setTimeout(() => {emit('update:renaming', false)}, 200);
}
</script>

<template>
  <Transition name="fade" mode="out-in">

    <!--Disconnected screen-->
    <div v-if="mobileFollower.disconnected" class="text-lg text-center h-full flex flex-col justify-center">
      <span class="mx-2 overflow-ellipsis whitespace-nowrap overflow-hidden">
        <span class="font-semibold">
          {{ mobileFollower.name }}
        </span>
        <br/> has left the lesson.
      </span>
    </div>

    <!--Options screen-->
    <div v-else-if="screenType === 'options'" class="h-full text-sm text-white flex flex-col justify-center bg-navy-side-menu border-b border-t-modal-site-background">
      <div class="h-6 cursor-pointer flex flex-row mx-2 px-2 items-center hover:bg-white-menu-overlay rounded">
        <img class="flex-shrink-0 w-3 h-3 mr-2" src="/src/assets/img/options-edit.svg" alt=""/>
        <span v-if="!renaming" v-on:click="$emit('update:renaming', true); focusInput()">Rename User</span>
        <input v-else ref="inputField" class="bg-navy-side-menu w-full pl-1" @input="$emit('update:name', $event.target.value)" @focusout="revertInput"/>
      </div>

      <div class="h-6 mt-1.5 cursor-pointer flex flex-row mx-2 px-2 items-center hover:bg-white-menu-overlay rounded"
           v-on:click="$emit('update:screenType', 'remove')">
        <img class="flex-shrink-0 w-3 h-3 mr-2" src="/src/assets/img/options-remove.svg" alt=""/>
        <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">Remove {{mobileFollower.name}}</span>
      </div>
    </div>

    <!--Remove screen-->
    <div v-else-if="screenType === 'remove'" class="text-base text-center h-full flex flex-col justify-center">
      <span>Remove from session?</span>
    </div>

    <!--App screen-->
    <div v-else-if="screenType === 'tabs'">
      <!--The assistant page is present but not counted-->
      <div v-if="currentlyActiveApplication === null" class="py-1">
        <div class="flex flex-row px-2 items-center">
          <img class="flex-shrink-0 w-4 h-4 mr-2" src="/src/assets/img/icon-128.png" alt=""/>
          <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">No applications...</span>
        </div>
      </div>

      <div v-else class="flex flex-col px-2">
        <div class="flex flex-row items-center mb-2">
          <img class="flex-shrink-0 w-4 h-4 mr-2" :src="currentlyActiveApplication.getIcon()"  alt="Icon"/>
          <span class="overflow-ellipsis whitespace-nowrap overflow-hidden">{{ currentlyActiveApplication.getName() }}</span>
        </div>
        <span v-if="currentlyActiveApplication.getName() === 'LeadMe VR'" class="overflow-ellipsis whitespace-nowrap overflow-hidden">{{ mobileFollower.action }}</span>
      </div>
    </div>

  </Transition>
</template>

<style>
/* apply transition to moving elements */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
}

/* ensure leaving items are taken out of layout flow so that moving
   animations can be calculated correctly. */
.list-leave-active {
  position: absolute;
}
</style>
