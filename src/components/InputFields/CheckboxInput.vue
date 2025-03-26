<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  value: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  checked: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: ""
  }
});
const emit = defineEmits<{
  (e: 'onChange', value: String): void
}>()

const iconClass = computed(() => {
  const { checked } = props;
  return {
    "check-box__icon": true,
    "check-box__icon--checked": checked,
  };
});

const handleClick = () => {
  emit("onChange", props.id);
};
</script>

<template>
  <div
      tabindex="0"
      role="checkbox"
      :aria-checked="props.checked"
      @click="handleClick"
      class="cursor-pointer"
  >
    <span :class="iconClass">
      <img v-if="checked" class="w-6 h-6" src="/src/assets/checkbox-checked.svg" alt="checked checkbox"/>
      <img v-else-if="theme !== 'dark'" class="w-6 h-6" src="/src/assets/checkbox-unchecked.svg" alt="unchecked checkbox"/>
      <img v-else-if="theme === 'dark'" class="w-6 h-6" src="/src/assets/checkbox-unchecked-grey.svg" alt="unchecked checkbox"/>
    </span>
    <span
        :id="`label-${props.id}`"
        class="label"
    >
      {{ props.label }}
    </span>
  </div>
</template>