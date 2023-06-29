<script setup lang="ts">
import ShareWebsiteModal from "../../../components/Modals/ShareWebsiteModal.vue";
import ShareApplicationModal from "@/components/Modals/ShareApplicationModal.vue";
import ShareVideoModal from "@/components/Modals/ShareVideoModal.vue";
import ShareMediaModal from "@/components/Modals/ShareMediaModal.vue";
import CuratedContentModal from "@/components/Modals/CuratedContentModal.vue";
import settingsIconUrl from '/src/assets/img/settings-icon-cog.svg';
import * as REQUESTS from "../../../constants/_requests";
import { ref } from "vue";
import { useDashboardStore } from "@/stores/dashboardStore";

const dashboardPinia = useDashboardStore();

//Reference to the separate media modals to open them externally
const websiteRef = ref<InstanceType<typeof ShareWebsiteModal> | null>(null)
function openWebsiteModal() {
  websiteRef.value?.openModal();
}

const applicationRef = ref<InstanceType<typeof ShareApplicationModal> | null>(null)
function openApplicationModal() {
  applicationRef.value?.openModal();
}

const videoRef = ref<InstanceType<typeof ShareVideoModal> | null>(null)
function openVideoModal() {
  videoRef.value?.openModal();
}
</script>

<template>
  <div class="mt-14 px-5 lg:px-10 sticky top-0 w-full py-4 bg-panel-background">
    <div class="flex flex-row justify-between items-center">
      <p class="text-3xl font-medium" v-if="dashboardPinia.user">{{ dashboardPinia.user.displayName }}'{{ dashboardPinia?.user?.displayName?.endsWith('s') ? '' : 's' }} Class</p>

      <router-link class="w-10 h-10" to="/account">
        <img :src="settingsIconUrl" alt="Icon"/>
      </router-link>
    </div>

    <!--Action Area-->
    <div class="mt-8 flex child:mr-4">

      <!--Media is the default however the others are needed as hidden references-->
      <ShareMediaModal @webModal="openWebsiteModal" @appModal="openApplicationModal" @videoModal="openVideoModal" />
      <div :class="{'hidden': true}">
        <ShareWebsiteModal ref="websiteRef" />
        <ShareApplicationModal ref="applicationRef" />
        <ShareVideoModal ref="videoRef" />
      </div>

      <!--Curated content-->
      <CuratedContentModal />
    </div>
  </div>
</template>

<style>
.lds-dual-ring-screen {
  display: inline-block;
  width: 20px;
  height: 20px;
}
.lds-dual-ring-screen:after {
  content: " ";
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  border-color: #ffffff transparent #ffffff transparent;
  animation: lds-dual-ring-screen 1.2s linear infinite;
}
@keyframes lds-dual-ring-screen {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>