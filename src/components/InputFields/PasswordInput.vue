<script setup lang="ts">
import {computed, ref} from "vue";
import PasswordIcon from "@/assets/vue/Login/PasswordIcon.vue";

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

const state = computed(() => {
  if (props.modelValue.length === 0 && !inputFocus.value) {
    return '#959EAF';
  } else if (inputFocus.value) {
    return '#3B82F6';
  } else if (props.modelValue.length > 0 && !inputFocus.value) {
    return 'black';
  }

  return '#959EAF';
})
</script>

<template>
  <div>
    <div class="flex flex-row">
      <div class="relative">
        <div class="absolute mt-3.5 left-3">
          <PasswordIcon class="w-5 h-5" :colour="state"/>
        </div>

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
