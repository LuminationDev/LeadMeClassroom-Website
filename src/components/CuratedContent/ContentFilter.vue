<script setup lang="ts">
import {watch, ref} from "vue";
import BasicDropdown from "@/components/InputFields/BasicDropdown.vue";
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

const emit = defineEmits<{
  (e: 'subjectQuery', value: string): void
  (e: 'topicQuery', value: string): void
  (e: 'yearQuery', value: string): void
}>()

const props = defineProps({
  selectedYear: {
    type: String,
    default: "R-12"
  },
  selectedSubject: {
    type: String
  },
  subjects: {
    type: Array,
    default: () => [],
    validator: (value: any) => {
      return value.every((item: any) => typeof item === 'string');
    }
  },
  selectedTopic: {
    type: String
  },
  topics: {
    type: Array,
    default: () => [],
    validator: (value: any) => {
      return value.every((item: any) => typeof item === 'string');
    }
  }
});

const lowerYearFilter = ref(props.selectedYear.split('-')[0] === 'R' ? '0' : props.selectedYear.split('-')[0]);
const upperYearFilter = ref(props.selectedYear.split('-')[1]);

const yearFilter = ref(["R", "12"])
watch(yearFilter, (newValue) => {
  emit('yearQuery', `${newValue[0]}-${newValue[1]}`)
})

const emitSubject = (data: string) => {
  emit('subjectQuery', data);
}

const emitTopic = (data: string) => {
  emit('topicQuery', data);
}
</script>

<template>
  <div class="h-full flex flex-col bg-white rounded-l-lg justify-around px-10">
    <!--Year selection-->
    <div class="w-52 flex flex-col">
      Years

      <div class="flex flex-col">
        <VueSlider v-model="yearFilter" :data="['R', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']"/>
      </div>
      <p>Selected range: {{ yearFilter[0] }} - {{ yearFilter[1] }}</p>
    </div>

    <!--Subject selection-->
    <div class="w-52 flex flex-col">
      Subjects

      <BasicDropdown :no-options="'no subjects'" :previous-option="selectedSubject" @selectedOption="emitSubject" :options="subjects"/>
    </div>

    <!--Topic selection-->
    <div class="w-52 flex flex-col">
      Topic

      <BasicDropdown :no-options="'no topics'" :previous-option="selectedTopic" @selectedOption="emitTopic" :options="topics"/>
    </div>
  </div>
</template>
