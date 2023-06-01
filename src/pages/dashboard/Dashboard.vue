<script setup lang="ts">
import TheDashboard from "../../components/Dashboard/TheDashboard.vue";
import {useDashboardStore} from "@/stores/dashboardStore";
import {onMounted, ref} from "vue";
const dashboardPinia = useDashboardStore();
const loaded = ref(false)
onMounted(async () => {
  await dashboardPinia.loadLeaderDetails().then(() => {
    loaded.value = true
  })
})
</script>

<template>
  <TheDashboard v-if="loaded" />
</template>
