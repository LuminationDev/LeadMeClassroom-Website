<script setup lang="ts">
import {ref} from "vue";
import ImageState from "@/components/Images/ImageState.vue";

const inputFocus = ref(false);
const props = defineProps({
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
  },
  fadedSrc: {
    type: String,
    required: true
  },
  activeSrc: {
    type: String,
    required: true
  },
  solidSrc: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    required: true
  }
});
const emit = defineEmits(['update:modelValue'])

function handleInput(inputEvent: Event) {
  // @ts-ignore
  emit('update:modelValue', inputEvent?.target?.value)
  props.v$.$commit()
  if (!props.v$.$invalid && props.v$.$dirty) {
    props.v$.$touch()
  }
}
</script>

<template>
  <div>
    <div class="flex flex-row">
      <div class="relative">
        <ImageState
            class="absolute mt-3.5 left-3 w-5 h-5"
            :faded="modelValue.length === 0 && !inputFocus"
            :active="inputFocus"
            :solid="modelValue.length > 0 && !inputFocus"
            :faded-src="fadedSrc"
            :active-src="activeSrc"
            :solid-src="solidSrc"
            :alt="alt"/>

        <input
            v-if="v$"
            class="w-64 h-12 pl-9 rounded-lg border-2 px-3 text-sm"
            :class="v$.$error ? 'border-red-800 focus:border-red-900' : ''"
            type='email'
            :placeholder='`${placeholder}`'
            :value="modelValue"
            @input="handleInput"
            @focus="inputFocus = true"
            @focusout="v$.$touch(); inputFocus = false"
        />
      </div>
    </div>

    <div class="flex flex-col items-start" v-if="v$ && v$.$error">
      <div class="text-red-800 text-sm" v-for="(error, index) in v$.$errors" :key="index">{{ error.$message }}</div>
    </div>
  </div>
</template>
