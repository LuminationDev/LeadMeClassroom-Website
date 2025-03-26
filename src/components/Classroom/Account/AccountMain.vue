<script setup lang="ts">
import AccountGrid from "./AccountGrid.vue";
import { useClassroomStore } from "@/stores/classroomStore";

const classroomPinia = useClassroomStore();
</script>

<template>
  <div class="mx-10 h-full">
    <div class="flex flex-row justify-between mt-24 mb-14">
      <p class="text-3xl font-medium">Your Settings</p>

      <router-link v-if="classroomPinia.accountView === 'main'" to="/">
        <img
          class="w-8 cursor-pointer"
          src="/src/assets/img/account-icon-exit.svg"
          alt="exit"/>
      </router-link>

      <div v-else>
        <img
          class="w-8 cursor-pointer"
          src="/src/assets/img/account-icon-exit.svg"
          alt="exit"
          v-on:click="classroomPinia.accountView = 'main'"/>
      </div>
    </div>

    <AccountGrid />
  </div>
</template>
