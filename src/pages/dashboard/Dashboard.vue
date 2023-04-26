<script setup lang="ts">
import TheDashboard from "../../components/Dashboard/TheDashboard.vue";
import { useDashboardStore } from "../../stores/dashboardStore";
import {useRouter} from "vue-router";
const dashboardPinia = useDashboardStore();
const router = useRouter()
</script>

<template>
  <TheDashboard />
</template>
