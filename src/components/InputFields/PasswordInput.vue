<script setup lang="ts">
import { ref } from "vue";
import passwordFaded from '/src/assets/img/login/login-icon-password-fade.svg';
import passwordActive from '/src/assets/img/login/login-icon-password-active.svg';
import passwordSolid from '/src/assets/img/login/login-icon-password-solid.svg';
import ImageState from "@/components/Images/ImageState.vue";

const inputFocus = ref(false);
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
  },
  showError: {
    type: Boolean,
    required: false,
    default: true
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
        <ImageState
            class="absolute mt-3.5 left-3 w-5 h-5"
            :faded="modelValue.length === 0 && !inputFocus"
            :active="inputFocus"
            :solid="modelValue.length > 0 && !inputFocus"
            :faded-src="passwordFaded"
            :active-src="passwordActive"
            :solid-src="passwordSolid"
            :alt="'password icon'"/>

        <input
            v-if="v$"
            class="w-64 h-12 pl-9 rounded-lg border-2 px-3 text-sm"
            :class="{
              'border-red-800 focus:border-red-900' : v$.$error,
            }"
            :type="showPassword ? 'text' : 'password'"
            :placeholder='`${placeholder}`'
            :value="modelValue"
            @input="handleInput"
            @focus="inputFocus = true"
            @focusout="inputFocus = false"
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

    <div class="flex flex-col items-start" v-if="v$ && v$.$error && showError">
      <div class="text-red-800 text-sm" v-for="error in v$.$errors">{{ error.$message }}</div>
    </div>
  </div>
</template>
