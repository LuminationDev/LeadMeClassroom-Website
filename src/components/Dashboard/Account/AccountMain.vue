<script setup lang="ts">
import AccountGrid from "./AccountGrid.vue";
</script>

<template>
  <div class="ml-10">
    <div class="mt-14 mb-14">
      <p class="text-3xl">Account Settings</p>
    </div>

    <AccountGrid />

    <!--TODO ask Matt where the new logout button goes-->
    <!--End the active session and logout-->
<!--    <GenericButton-->
<!--        class="fixed bottom-12 w-24 h-12"-->
<!--        v-on:click="dashboardPinia.endSession(); popupPinia.handleLogoutClick()"-->
<!--        callback=""-->
<!--    >Log Out</GenericButton>-->
  </div>
</template>
