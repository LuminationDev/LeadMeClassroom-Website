<script setup lang="ts">
import {ref} from "vue";

defineProps({
  placeholder: {
    type: String,
    required: true,
  },
  modelValue: {
    type: String,
    required: true
  },
  v$: {
    type: Object,
    required: true
  }
});
const emit = defineEmits(['update:modelValue'])

const showPassword = ref(false)

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <div class="flex flex-row">
      <div class="relative">
        <input
            v-if="v$"
            class="w-64 h-12 rounded-lg border-2 px-3 text-sm"
            :class="v$.$error ? 'border-red-800 focus:border-red-900' : 'border-r-white border-l-gray-200 border-b-gray-200 border-t-gray-200'"
            :type="showPassword ? 'text' : 'password'"
            :placeholder='placeholder'
            :value="modelValue"
            @input="handleInput"
        />
        <button
            type="button"
            class="absolute right-0 w-6 h-5 mt-3.5 mr-2 rounded-br-lg rounded-tr-lg bg-white"
            @click="showPassword = !showPassword">
          <span class="flex justify-center">
            <img v-if="showPassword" class="w-6 h-5" src="/src/assets/icons/eye-icon.svg" alt="Icon"/>
            <img v-else class="w-6 h-5" src="/src/assets/icons/eye-slash-icon.svg" alt="Icon"/>
          </span>
        </button>
      </div>
    </div>

    <div class="flex flex-col items-start" v-if="v$ && v$.$error">
      <div class="text-red-800" v-for="error in v$.$errors">{{ error.$message }}</div>
    </div>
  </div>
</template>
