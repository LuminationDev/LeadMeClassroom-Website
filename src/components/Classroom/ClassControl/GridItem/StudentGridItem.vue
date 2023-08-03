<script setup lang="ts">
import { computed, ref } from 'vue'
import type { PropType } from 'vue'
import * as REQUESTS from "@/constants/_requests";
import WebFollowerIcon from "@/assets/vue/WebFollowerIcon.vue";
import MobileFollowerIcon from "@/assets/vue/MobileFollowerIcon.vue";
import type { Follower } from "@/models";
import EllipsisIcon from "@/assets/vue/EllipsisIcon.vue";
import CheckboxInput from "@/components/InputFields/CheckboxInput.vue";
import StudentGridItemSettings from "@/components/Classroom/ClassControl/GridItem/StudentGridItemSettings.vue";
import StudentGridItemRemoval from "@/components/Classroom/ClassControl/GridItem/StudentGridItemRemoval.vue";
import StudentGridItemDisconnected from "@/components/Classroom/ClassControl/GridItem/StudentGridItemDisconnected.vue";
import StudentDetailModal from "@/components/Modals/StudentDetails/StudentDetailModal.vue";
import ScreenMonitorModal from "@/components/Modals/ScreenMonitorModal.vue";
import EyeSlashIcon from "@/assets/vue/Login/EyeSlashIcon.vue";

const emit = defineEmits<{
  (e: 'selectionToggled', value: boolean): void
}>()

const selectionToggled = () => {
  emit('selectionToggled', !props.selected);
}

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
  selected: {
    type: Boolean,
    required: true
  },
  controls: {
    type: Boolean,
    required: false,
    default: true
  }
});

const studentPanel = ref('main');
const changePanel = (panel: string) => {
  studentPanel.value = panel;
}

//Reference to the screen monitor modal to open it externally
const monitorRef = ref<InstanceType<typeof ScreenMonitorModal> | null>(null)
function openMonitorModal() {
  monitorRef.value?.initiateMonitoring();
}

const studentDetailModal = ref<InstanceType<typeof StudentDetailModal> | null>(null)

const colourState = computed(() => {
  if(props.selected) {
    return '#3B82F6';
  } else if (!props.selected && !props.follower.locked) {
    return '#BDC3D6';
  } else if (!props.selected && props.follower.locked) {
    return '#374151';
  }

  return '#BDC3D6';
})

function openModal() {
  studentDetailModal.value?.openModal()
}
</script>

<template>
  <div class="w-64 transition-all duration-500 ease-in-out relative cursor-pointer" @click="openModal">
    <div class="h-36 flex flex-col rounded-lg pt-4 pl-4 pr-4 pb-2"
      :class="{
        'bg-zinc-200 border-2 border-solid border-zinc-200 hover:bg-gray-200': !selected && !follower.locked,
        'bg-blue-200 border-2 border-solid border-blue-500': selected,
        'bg-zinc-500 opacity-80 border-2 border-solid border-zinc-600': !selected && follower.locked
      }">

      <!--Disconnected panel-->
      <StudentGridItemDisconnected
          v-if="follower.disconnected"
          :follower="follower"/>

      <!--Front of card-->
      <div v-else-if="studentPanel === 'main'">
        <div class="flex flex-row justify-between">
          <span class="text-lg font-medium" :class="{
          'text-blue-500': selected
        }">{{ follower.name }}</span>
          <div class="flex flex-row">
            <WebFollowerIcon v-if="follower.type === REQUESTS.WEB" class="h-6 w-6 mr-2" :colour="colourState" />
            <MobileFollowerIcon v-else-if="follower.type === REQUESTS.MOBILE" class="h-6 w-6 mr-2" :colour="colourState" />
            <CheckboxInput :checked="selected" @on-change="selectionToggled" @click.stop :theme="follower.locked ? 'dark' : ''" />
          </div>
        </div>

        <!--Open student details-->
        <div class="relative mb-3 mt-4">
          <div class="rounded-full text-gray-500" :class="{
          'bg-blue-100': selected,
          'bg-white': !selected && !follower.locked,
          'bg-neutral-400 opacity-40': follower.locked
        }">
            <StudentDetailModal ref="studentDetailModal" :follower="follower" @screenMonitor="openMonitorModal"/>
          </div>
          <EyeSlashIcon
              v-if="follower.locked" class="top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 absolute w-16 h-16" :colour="selected ? '#3B82F6' : '#374151'"/>
        </div>

        <div class="flex flex-row justify-end">
          <EllipsisIcon v-on:click.stop="changePanel('settings')" class="h-5 cursor-pointer" :colour="colourState"/>
        </div>
      </div>

      <!--Settings panel-->
      <StudentGridItemSettings
          v-else-if="studentPanel === 'settings'"
          :follower="follower"
          @screenMonitor="openMonitorModal"
          @changePanel="changePanel"/>

      <!--Confirm removal panel-->
      <StudentGridItemRemoval
          v-else-if="studentPanel === 'confirm'"
          :follower="follower"
          @changePanel="changePanel"/>

      <!--Screen capture (overview mode) panel-->
      <div v-else-if="studentPanel === 'overview'">
        OVERVIEW MODE
      </div>
    </div>

    <!--TODO HIDDEN FOR NOW - DO WE WANT TO OPEN IT DIRECTLY FROM THE CARD?-->
    <div class="hidden">
      <!--Screenshot and WebRTC modal-->
      <ScreenMonitorModal ref="monitorRef" :follower="follower" @studentDetail="openModal"/>
    </div>
  </div>
</template>
