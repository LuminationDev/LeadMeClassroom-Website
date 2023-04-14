<script setup lang="ts">
import TheDashboard from "../../components/Dashboard/TheDashboard.vue";
import { useDashboardStore } from "../../stores/dashboardStore";
const dashboardPinia = useDashboardStore();
</script>

<template>
  <TheDashboard />
</template>
