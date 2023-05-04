<script setup lang="ts">
import {defineProps, PropType, ref} from 'vue'
import { WebFollower } from "../../../../../models";
import WebGridItemFooter from "./WebGridItemFooter.vue";
import WebGridItemContent from "./WebGridItemContent.vue";
import WebGridItemHeader from "./WebGridItemHeader.vue";

const emit = defineEmits<{
  (e: 'update', value: boolean): void
}>()

/**
 * Bubble the emit up to the share website modal when required.
 * @param value
 */
function checked(value: boolean) {
  emit('update', value);
}

const removing = ref(false);
const screenType = ref("tabs");
const renaming = ref(false);
const name = ref("");

defineProps({
  webFollower: {
    type: Object as PropType<WebFollower>,
    required: true,
  },
  controls: {
    type: Boolean,
    required: false,
    default: true
  }
});

/**
 * Opens the details modal which contains the listed tabs of a student.
 */
const detailsRef = ref<InstanceType<typeof WebGridItemFooter> | null>(null)
function openDetails() {
  detailsRef.value?.openDetailsModal();
}
</script>

<template>
  <div class="w-48 transition-all duration-500 ease-in-out" :class="removing ? 'opacity-0' : ''" :id="webFollower.getUniqueId()">
    <div class="h-[120px] flex flex-col bg-gray-active-student border-2 border-navy-side-menu rounded-t-sm">
      <WebGridItemHeader
          @update="checked"
          :webFollower="webFollower"
          :controls="controls"
          v-model:screenType="screenType"
          @studentDetails="openDetails" />

      <WebGridItemContent
          :webFollower="webFollower"
          :controls="controls"
          v-model:name="name"
          v-model:renaming="renaming"
          v-model:screenType="screenType" />
    </div>

    <WebGridItemFooter
        ref="detailsRef"
        :webFollower="webFollower"
        :controls="controls"
        :name="name"
        :renaming="renaming"
        v-model:removing="removing"
        v-model:screenType="screenType"/>
  </div>
</template>
