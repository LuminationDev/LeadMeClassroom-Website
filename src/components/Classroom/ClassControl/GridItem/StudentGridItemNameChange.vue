<script setup lang="ts">
import { defineProps, PropType, ref } from "vue";
import { Follower } from "@/models";
import { useClassroomStore } from "@/stores/classroomStore";

defineEmits<{
  (e: 'changePanel', value: string): void
}>();

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  }
});

const classroomPinia = useClassroomStore();

const name = ref('');
const updateFollowerName = () => {
  if(name.value.length === 0) { return; }
  classroomPinia.renameFollower(name.value, props.follower.getUniqueId(), props.follower.type);
}
</script>

<template>
  <div class="h-24">
    Change name

    <input class="mt-2" v-model="name"/>

    <!--TODO temporary placeholder-->
    <div v-on:click="updateFollowerName" class="mx-5 mt-3 cursor-pointer bg-gray-300 text-center rounded-xl hover:bg-white">
      Confirm
    </div>
  </div>

  <div class="flex flex-row justify-end items-center h-5 mr-2">
    <img v-on:click="$emit('changePanel', 'settings')" class="cursor-pointer" src="/src/assets/img/cross.svg" alt="cross"/>
  </div>
</template>
