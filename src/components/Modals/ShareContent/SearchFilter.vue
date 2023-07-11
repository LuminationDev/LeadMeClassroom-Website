<script setup lang="ts">
defineProps({
  modelValue: {
    type: String,
    required: true
  },
  showFilter: {
    type: Boolean,
    require: true
  }
})

const emit = defineEmits(['update:modelValue', 'changeFilter'])

function handleInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex flex-row items-center">
    <!--Allow a user to search via the input-->
    <div class="flex items-center w-76 mr-1">
      <label for="searchInput" class="cursor-pointer w-6 h-6 ml-3 absolute">
        <img src="/src/assets/img/search-icon.svg" alt="Search"/>
      </label>

      <input
          id="searchInput"
          :value="modelValue"
          @input="handleInput"
          placeholder="Search titles"
          class="h-10 w-72 pr-6 pl-10 rounded-3xl outline-0 text-black text-sm bg-gray-100"/>

      <img
          v-on:click="$emit('update:modelValue', '')"
          :class="{
                    'w-3 h-3 relative right-6 cursor-pointer': true,
                    'invisible': modelValue === ''
                  }"
          src="/src/assets/img/cross.svg" alt="Search"/>
    </div>

    <!--Show the filter menu-->
    <button v-on:click="$emit('changeFilter')">
      <img src="/src/assets/icons/filter.svg" alt="Filter">
    </button>
  </div>
</template>
