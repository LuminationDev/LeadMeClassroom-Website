<script setup lang="ts">
import { defineProps, ref } from 'vue'
import type { PropType } from 'vue'
import * as REQUESTS from "@/constants/_requests";
import WebFollowerIcon from "@/assets/vue/WebFollowerIcon.vue";
import MobileFollowerIcon from "@/assets/vue/MobileFollowerIcon.vue";
import { Follower } from "@/models";
import EllipsisIcon from "@/assets/vue/EllipsisIcon.vue";
import CheckboxInput from "@/components/InputFields/CheckboxInput.vue";
import StudentGridItemSettings from "@/components/Classroom/ClassControl/GridItem/StudentGridItemSettings.vue";
import StudentGridItemRemoval from "@/components/Classroom/ClassControl/GridItem/StudentGridItemRemoval.vue";
import StudentGridItemDisconnected from "@/components/Classroom/ClassControl/GridItem/StudentGridItemDisconnected.vue";
import StudentDetailModal from "@/components/Modals/StudentDetails/StudentDetailModal.vue";
import ScreenMonitorModal from "@/components/Modals/ScreenMonitorModal.vue";
import MobileStudentDetailModal from "@/components/Modals/MobileStudentDetailModal.vue";

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

function openModal() {
  studentDetailModal.value?.openModal()
}
</script>

<template>
  <div class="w-64 transition-all duration-500 ease-in-out">
    <div class="h-36 flex flex-col rounded-lg pt-4 pl-4 pr-4 pb-2"
      :class="{
        'bg-zinc-200 border-2 border-solid border-zinc-200': !selected,
        'border-2 border-solid border-blue-500 bg-blue-200': selected
      }">

      <!--Disconnected panel-->
      <StudentGridItemDisconnected
          v-if="follower.disconnected"
          :follower="follower"
      />

      <!--Front of card-->
      <div v-else-if="studentPanel === 'main'">
        <div class="flex flex-row justify-between" @click="openModal">
          <span class="text-lg font-medium" :class="{
          'text-blue-500': selected
        }">{{ follower.name }}</span>
          <div class="flex flex-row">
            <WebFollowerIcon v-if="follower.type === REQUESTS.WEB" class="h-6 w-6 mr-2" :colour="selected ? '#3B82F6' : '#BDC3D6'" />
            <MobileFollowerIcon v-else-if="follower.type === REQUESTS.MOBILE" class="h-6 w-6 mr-2" :colour="selected ? '#3B82F6' : '#BDC3D6'" />
            <CheckboxInput :checked="selected" @on-change="selectionToggled" @click.stop />
          </div>
        </div>
        <div class="rounded-full text-gray-500 mt-4 mb-3" :class="{
          'bg-blue-100': selected,
          'bg-white': !selected
        }">
          <StudentDetailModal ref="studentDetailModal" :follower="follower" @screenMonitor="openMonitorModal"/>
        </div>
        <div class="flex flex-row justify-end">
          <EllipsisIcon v-on:click.stop="changePanel('settings')" class="h-5 cursor-pointer" :colour="selected ? '#3B82F6' : '#BDC3D6'"/>
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
      <ScreenMonitorModal ref="monitorRef" :follower="follower" />
    </div>
  </div>
</template>
