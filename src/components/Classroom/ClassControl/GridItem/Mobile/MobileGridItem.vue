<script setup lang="ts">
import { ref } from 'vue'
import type {PropType} from 'vue'
import type { MobileFollower } from "../../../../../models";
import MobileGridItemFooter from "./MobileGridItemFooter.vue";
import MobileGridItemContent from "./MobileGridItemContent.vue";
import MobileGridItemHeader from "./MobileGridItemHeader.vue";

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
  mobileFollower: {
    type: Object as PropType<MobileFollower>,
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
const detailsRef = ref<InstanceType<typeof MobileGridItemFooter> | null>(null)
function openDetails() {
  detailsRef.value?.openDetailsModal();
}
</script>

<template>
  <div class="w-48 transition-all duration-500 ease-in-out" :class="removing ? 'opacity-0' : ''" :id="mobileFollower.getUniqueId()">
    <div class="h-[120px] flex flex-col bg-gray-active-student border-2 border-navy-side-menu rounded-t-sm">
      <MobileGridItemHeader
          @update="checked"
          :mobileFollower="mobileFollower"
          :controls="controls"
          v-model:screenType="screenType"
          @studentDetails="openDetails" />

      <MobileGridItemContent
          :mobileFollower="mobileFollower"
          :controls="controls"
          v-model:name="name"
          v-model:renaming="renaming"
          v-model:screenType="screenType" />
    </div>

    <MobileGridItemFooter
        ref="detailsRef"
        :mobileFollower="mobileFollower"
        :controls="controls"
        :name="name"
        :renaming="renaming"
        v-model:removing="removing"
        v-model:screenType="screenType"/>
  </div>
</template>
