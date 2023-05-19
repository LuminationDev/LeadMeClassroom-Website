<script setup lang="ts">
import {watch, ref} from "vue";
import BasicDropdown from "@/components/InputFields/BasicDropdown.vue";

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

watch(lowerYearFilter, (newValue) => {
  if(parseInt(newValue) >= parseInt(upperYearFilter.value)) {
    upperYearFilter.value = newValue;
  }

  //Emit new range
  emit('yearQuery', `${lowerYearFilter.value === '0' ? 'R' : lowerYearFilter.value}-${upperYearFilter.value === '0' ? 'R' : upperYearFilter.value}`);
});

watch(upperYearFilter, (newValue) => {
  if(parseInt(newValue) <= parseInt(lowerYearFilter.value)) {
    lowerYearFilter.value = newValue;
  }

  //Emit new range
  emit('yearQuery', `${lowerYearFilter.value === '0' ? 'R' : lowerYearFilter.value}-${upperYearFilter.value === '0' ? 'R' : upperYearFilter.value}`);
})

const emitSubject = (data: string) => {
  emit('subjectQuery', data);
}

const emitTopic = (data: string) => {
  emit('topicQuery', data);
}
</script>

<template>
  <div class="w-modal-width h-20 flex flex-row bg-white rounded-b-lg justify-around">
    <!--Year selection-->
    <div class="w-52 flex flex-col">
      Years

      <div class="flex flex-col">
        <input type="range" v-model="lowerYearFilter" :min="0" :max="12" :step="1"/>
        <input type="range" v-model="upperYearFilter" :min="0" :max="12" :step="1"/>
      </div>
      <p>Selected range: {{ lowerYearFilter === '0' ? 'R' : lowerYearFilter }} - {{ upperYearFilter === '0' ? 'R' : upperYearFilter}}</p>
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
