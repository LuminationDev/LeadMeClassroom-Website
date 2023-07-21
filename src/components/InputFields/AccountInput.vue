<script setup lang="ts">
import { ref } from "vue";
import PasswordIcon from "@/assets/vue/Login/PasswordIcon.vue";
import PersonIcon from "@/assets/vue/Login/PersonIcon.vue";
import EmailIcon from "@/assets/vue/Login/EmailIcon.vue";
import { computed } from "vue";

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
  type: {
    type: String,
    required: true
  },
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
          <EmailIcon v-if="type === 'email'" class="w-5 h-5" :colour="state"/>
          <PasswordIcon v-if="type === 'password'" class="w-5 h-5" :colour="state"/>
          <PersonIcon v-if="type === 'name'" class="w-5 h-5" :colour="state"/>
        </div>

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
