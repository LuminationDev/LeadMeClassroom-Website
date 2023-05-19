<script setup lang="ts">
import {computed, ref} from "vue";

const emit = defineEmits<{
  (e: 'selectedOption', value: string): void
}>()

const props = defineProps({
  previousOption: {
    type: String
  },
  options: {
    type: Array,
    default: () => ['Option 1', 'Option 2', 'Option 3'],
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
    if (!props.previousOption) {
      return selectedOption?.value === undefined ? "Select an option" : selectedOption.value;
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

    <ul v-if="isOpen" class="w-52 max-h-96 overflow-y-auto absolute z-10 mt-2 py-2 bg-white border border-gray-300 rounded-md shadow-sm">
      <li
          @click="selectOption(undefined)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100">
        {{ 'Select an option' }}
      </li>
      <li v-for="option in options"
          :key="option"
          @click="selectOption(option)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100">
        {{ option }}
      </li>
    </ul>
  </div>
</template>
