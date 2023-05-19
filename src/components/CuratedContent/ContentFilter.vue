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
    default: "1-12"
  },
  selectedSubject: {
    type: String
  },
  subjects: {
    type: Array,
    default: () => ['Subject 1', 'Subject 2', 'Subject 3'],
    validator: (value: any) => {
      return value.every((item: any) => typeof item === 'string');
    }
  },
  selectedTopic: {
    type: String
  },
  topics: {
    type: Array,
    default: () => ['Topic 1', 'Topic 2', 'Topic 3'],
    validator: (value: any) => {
      return value.every((item: any) => typeof item === 'string');
    }
  }
});

const lowerYearFilter = ref(parseInt(props.selectedYear.split('-')[0]));
const upperYearFilter = ref(parseInt(props.selectedYear.split('-')[1]));

watch(lowerYearFilter, (newValue) => {
  if(parseInt(newValue) >= upperYearFilter.value) {
    upperYearFilter.value = newValue;
  }

  //Emit new range
  emit('yearQuery', lowerYearFilter.value + "-" + upperYearFilter.value);
});

watch(upperYearFilter, (newValue) => {
  if(parseInt(newValue) <= lowerYearFilter.value) {
    lowerYearFilter.value = newValue;
  }

  //Emit new range
  emit('yearQuery', lowerYearFilter.value + "-" + upperYearFilter.value);
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
        <input type="range" v-model="lowerYearFilter" :min="1" :max="12" :step="1"/>
        <input type="range" v-model="upperYearFilter" :min="1" :max="12" :step="1"/>
      </div>
      <p>Selected range: {{ lowerYearFilter }} - {{ upperYearFilter }}</p>
    </div>

    <!--Subject selection-->
    <div class="w-52 flex flex-col">
      Subjects

      <BasicDropdown :previous-option="selectedSubject" @selectedOption="emitSubject" :options="subjects"/>
    </div>

    <!--Topic selection-->
    <div class="w-52 flex flex-col">
      Topic

      <BasicDropdown :previous-option="selectedTopic" @selectedOption="emitTopic" :options="topics"/>
    </div>
  </div>
</template>
