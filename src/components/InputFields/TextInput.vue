<script setup lang="ts">
defineProps({
  placeholder: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true
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
function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <div class="relative">
      <input
          v-if="v$"
          class="w-full h-12 rounded-lg border-2 px-3 text-sm"
          :class="v$.$error ? 'border-red-800 focus:border-red-900' : ''"
          :type='type'
          :placeholder='`${placeholder}`'
          :value="modelValue"
          @input="handleInput"
      />
    </div>

    <div class="flex flex-col items-start" v-if="v$ && v$.$error">
      <div class="text-red-800 text-sm" v-for="(error, index) in v$.$errors" :key="index">{{ error.$message }}</div>
    </div>
  </div>
</template>
