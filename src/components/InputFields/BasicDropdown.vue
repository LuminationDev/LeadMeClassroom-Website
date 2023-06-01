<script setup lang="ts">
import {computed, ref} from "vue";
import type {PropType} from "vue";

const emit = defineEmits<{
  (e: 'selectedOption', value: string): void
}>()

const props = defineProps({
  noOptions: {
    type: String,
    required: true
  },
  previousOption: {
    type: String
  },
  options: {
    type: Array as PropType<string[]>,
    default: () => [],
    validator: (value: any) => {
      return value.every((item: any) => typeof item === 'string');
    }
  }
});

const selectedOption = ref('Select an option');
const isOpen = ref(false);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (option: string) => {
  emit('selectedOption', option)
  selectedOption.value = option;
  isOpen.value = false;
};

const displayOption = computed(() => {
  if(props.options.length === 0) {
    return props.noOptions;
  } else if (!props.previousOption) {
    return selectedOption?.value === "" ? "Select an option" : selectedOption.value;
  } else {
    return props.previousOption;
  }
});
</script>

<template>
  <div class="relative w-52">
    <button @click="toggleDropdown"
            class="w-52 px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm">
      {{displayOption}}
    </button>

    <ul v-if="isOpen && options.length > 0" class="w-52 max-h-96 overflow-y-auto absolute z-10 mt-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm">
      <li
          @click="selectOption('')"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100">
        {{ 'Select an option' }}
      </li>
      <li v-for="(option, index) in options"
          :key="index"
          @click="selectOption(option)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100">
        {{ option }}
      </li>
    </ul>
  </div>
</template>
