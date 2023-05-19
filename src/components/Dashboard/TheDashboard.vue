<script setup lang="ts">
import DashboardOnboarding from "./DashboardOnboarding.vue";
import DashboardSideMenu from "./DashboardSideMenu.vue";
import DashboardTitleBar from "./DashboardTitleBar.vue";
import { onBeforeMount, onMounted, ref } from "vue";
import { getAuth } from "@firebase/auth";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useRouter } from "vue-router";
import axios from "axios";
import { CuratedContentItem } from "@/models";

const dashboardPinia = useDashboardStore();
const router = useRouter()

const emailVerified = ref(false)

//Reference to the screen monitor modal to open it externally
const childRef = ref<InstanceType<typeof DashboardOnboarding> | null>(null)
function startOnboarding() {
  childRef.value?.start();
}

//Check for any active class on load
onMounted(async () => {
  const auth = getAuth()
  dashboardPinia.user = auth.currentUser
  if (dashboardPinia.user) {
    emailVerified.value = dashboardPinia.user.emailVerified
  }
  await dashboardPinia.attachClassListeners(true)

  // todo
  // startOnboarding()
  // getSyncStorage("onboarding_completed").then(result => {
  //   // if (result && result === true) { return; }
  //   startOnboarding()
  // });

  //TODO not sure if this is the best place for this.
  dashboardPinia.curatedContent = await getData(request);
});

onBeforeMount(() => {
  router.push({
    name: 'dashboard'
  });
});





//TODO not sure if this is the best place for this.
const convertValuesToModel = (values: any[][]): CuratedContentItem[] => {
  //Remove the description row
  const valuesToConvert = values.slice(1);

  return valuesToConvert.map(([title, description, type, link, years, subjects, topics, live]) =>
      new CuratedContentItem(title, description, type, link, years, subjects, topics, live)
  );
}

//Load in the Google sheets data for the curated content
const apiKey = "AIzaSyDn2DQ-ifbiMDJr610CBjbbQDh9nm1UG38";
const spreadsheetId = '1qAmBZyXIHGaRIR1ZdV4r0JC7lRhYOXuAxS23mVvzqgg';
const range = 'Sheet1!A1:H100'; // Replace with your desired sheet name and range
const request = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${range}&key=${apiKey}`;
const getData = async (apiUrl: string): Promise<CuratedContentItem[]> => {
  return await axios.get(apiUrl).then((res) => {
    return convertValuesToModel(res.data.valueRanges[0].values);
  }).catch(error => {
    console.log(error);
    return [];
  });
}
</script>

<template>
  <div class="flex font-poppins">
    <!--SideMenu-->
    <DashboardSideMenu v-if="dashboardPinia.user" />

    <div class="flex flex-grow flex-col h-screen">
      <!--TitleBar-->
      <DashboardTitleBar v-if="dashboardPinia.user" />

      <!--MainArea-->
      <div class="flex flex-col flex-grow bg-panel-background font-poppins overflow-hidden">
        <router-view />
      </div>
    </div>
  </div>
</template>
