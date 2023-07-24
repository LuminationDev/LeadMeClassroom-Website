<script setup lang="ts">
import {computed, defineProps, PropType, ref} from "vue";
import {Application, MobileFollower} from "@/models";
import Tooltip from "@/components/Buttons/Tooltip.vue";
import { useClassroomStore } from "@/stores/classroomStore";
import * as REQUESTS from "@/constants/_requests";
import PromoteIcon from "@/assets/vue/PromoteIcon.vue";

const classroomPinia = useClassroomStore();

const props = defineProps({
  follower: {
    type: Object as PropType<MobileFollower>,
    required: true,
  },
});

const activeApplication = computed(() => {
  return props.follower.activeApplication
});

//Track the currently selected application
const selectedApplicationId = ref(REQUESTS.MOBILE_PACKAGE);
const selectedApplication = computed(() => {
  const packageName = props.follower.currentApplication;
  console.log(packageName);

  if (props.follower.applications.length === 0) {
    selectedApplicationId.value = "-1";
    return null;
  }

  let application = props.follower.applications.find(res => res.id === selectedApplicationId.value);

  if (application === undefined) {
    selectedApplicationId.value = props.follower.applications[0].id;
    return props.follower.applications[0];
  } else {
    return application;
  }
});

/**
 * Change the currently active application to the supplied one. This will open it on the follower's device or bring it
 * back to the foreground.
 * @param application An {@link Application} containing the package name required for opening.
 */
const changeActiveApplication = (application: Application|null) => {
  if (application === null) {
    return
  }
  classroomPinia.requestActiveMedia(
      props.follower.getUniqueId(),
      { type: REQUESTS.FORCEACTIVEAPP, action: application.getPackageName() },
      REQUESTS.MOBILE
  );
}

/**
 * Check if the lastActivated website is within the tasks array. The task array is populated when a teacher pushes
 * out a website.
 * @param packageName A string representing the package name of the currently active application for a follower.
 */
const checkMedia = (packageName: string) => {
  let tasks = classroomPinia.mobileTasks;
  if(tasks.length === 0) { return; }

  return !tasks.some((res) => (packageName.includes(res.toString())));
}
</script>

<template>
  <!--Application list-->
  <div class="mx-4 flex flex-col">
    <!--The assistant page is present but not counted-->
    <div v-if="follower.applications.length === 0" class="py-1 flex flex-row w-full px-5 items-center justify-between">
      <div class="w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap">
        <img class="flex-shrink-0 w-5 h-5 mr-2" src="/src/assets/img/icon-128.png"  alt=""/>
        <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">No applications...</span>
      </div>
    </div>

    <!--Active Application-->
    <div v-else>
      <div class="flex items-center bg-white h-12 rounded-2xl mb-4">
        <div class="flex flex-row w-full px-5 items-center justify-between">
          <div :class="{
                      'w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap': true,
                      'overflow-hidden rounded-lg': true,
                      }"
          >
            <img v-if="activeApplication" class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" :src="classroomPinia.firebase.getAppIcon(activeApplication.packageName) ?? undefined" alt=""/>
            <span v-if="activeApplication" class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ activeApplication.getName() }}</span>

            <!--Audible icons-->
            <div class="flex flex-shrink-0 flex-[1_1_auto] justify-end">
              <div class="text-sm text-gray-500 font-semibold">
                ACTIVE APP
              </div>

              <div class="h-4 mr-4 flex flex-row justify-center">
                <Transition name="icon">
                  <div v-if="activeApplication && activeApplication.audible" class="pulse-icon">
                    <div v-if="activeApplication.muting" class="lds-dual-ring" />
                    <img v-else-if="activeApplication.muted" src="/src/assets/img/studentDetails/student-icon-sound-disabled.svg"  alt=""/>
                    <img v-else src="/src/assets/img/studentDetails/student-icon-sound.svg"  alt=""/>
                  </div>
                </Transition>
              </div>
            </div>

            <!--Alert for off task-->
            <Transition name="icon">
              <div v-if="activeApplication && checkMedia(activeApplication.id)" class="has-tooltip">
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

      <!--Application list-->
      <div class="bg-white rounded-2xl h-[28rem] overflow-y-auto">
        <div class="py-4 px-10 text-sm text-gray-500 font-semibold">APPLICATIONS</div>

        <transition-group name="list-complete" tag="div">
          <div v-for="(application, index) in follower.applications" :key="index" class="py-1" :id="application.id">

            <!--Individual applications-->
            <div class="flex flex-row w-full px-5 items-center justify-between">
              <div :class="{
                    'w-full h-9 px-5 flex flex-row items-center overflow-ellipsis whitespace-nowrap': true,
                    'overflow-hidden rounded-lg cursor-pointer': true,
                    'hover:bg-opacity-50 hover:bg-gray-300': selectedApplication?.id !== application.id,
                    'bg-blue-100': selectedApplication?.id === application.id,
                    }"
                   @click="selectedApplicationId = application.id"
              >
                <img class="flex-shrink-0 w-5 h-5 mr-2 cursor-pointer" :src="classroomPinia.firebase.getAppIcon(application.packageName) ?? undefined" alt=""/>
                <span class="flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden pr-10 mt-0.5">{{ application.getName() }}</span>

                <!--Audible icons-->
                <div class="flex flex-shrink-0 flex-[1_1_auto] justify-end">
                  <div class="h-4 flex flex-row justify-center items-center">
                    <Transition name="icon">
                      <div v-if="application.audible" class="pulse-icon">
                        <div v-if="application.muting" class="lds-dual-ring" />
                        <img v-else-if="application.muted" src="/src/assets/img/studentDetails/student-icon-sound-disabled.svg"  alt=""/>
                        <img v-else src="/src/assets/img/studentDetails/student-icon-sound.svg"  alt=""/>
                      </div>
                    </Transition>

                    <PromoteIcon v-if="selectedApplicationId === application.id && (!activeApplication || activeApplication.id !== application.id)"
                                 v-on:click="changeActiveApplication(application)"
                                 class="ml-1"
                                 :colour="'gray'"/>
                  </div>
                </div>

                <!--Alert for off task-->
                <Transition name="icon">
                  <div v-if="checkMedia(application.id)" class="has-tooltip">
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
