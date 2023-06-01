<script setup lang="ts">
import * as REQUESTS from "@/constants/_requests";
import { useDashboardStore } from "@/stores/dashboardStore";
import { computed, ref } from "vue";
import type { PropType } from "vue";
import type { MobileFollower } from "@/models";
import MediaButton from "@/components/Buttons/MediaButton.vue";

const dashboardPinia = useDashboardStore();

const props = defineProps({
  mobileFollower: {
    type: Object as PropType<MobileFollower>,
    required: true,
  }
});

const requestedAction = ref("none");
const loading = computed(() => {
  //If the mobileFollower action and selected action are not the same then show the loading symbol for x seconds or
  //until the actions are aligned

  // eslint-disable-next-line vue/no-async-in-computed-properties
  setTimeout(() => {
    if(requestedAction.value !== props.mobileFollower.action) {
      requestedAction.value = props.mobileFollower.action;
    }
  }, 3000);

  return requestedAction.value !== props.mobileFollower.action;
});

/**
 * Send a new action to the VR video player.
 * @param action A string of the action to take.
 */
const sendVideoAction = (action: string) => {
  requestedAction.value = action;

  dashboardPinia.requestIndividualAction(
      props.mobileFollower.getUniqueId(),
      { type: REQUESTS.VIDEOACTION, action: action },
      REQUESTS.MOBILE
  );
}
</script>

<template>
  <div class="flex flex-row justify-center items-center">
    <!--Stop button-->
    <MediaButton
      :mobile-follower="mobileFollower"
      :action-value="'stop'"
      :image-src="'/src/assets/img/mediaPlayer/media-stop-icon.svg'"
      :inactive-image-src="'/src/assets/img/mediaPlayer/media-stop-icon-non.svg'"
      :loading="loading"
      :requested="requestedAction"
      :send-action="() => sendVideoAction(REQUESTS.VIDEOACTIONSTOP)"
    />

    <!--Play button-->
    <MediaButton
        :mobile-follower="mobileFollower"
        :action-value="'play'"
        :image-src="'/src/assets/img/mediaPlayer/media-play-icon.svg'"
        :inactive-image-src="'/src/assets/img/mediaPlayer/media-play-icon-non.svg'"
        :loading="loading"
        :requested="requestedAction"
        :send-action="() => sendVideoAction(REQUESTS.VIDEOACTIONPLAY)"
    />

    <!--Pause button-->
    <MediaButton
        :mobile-follower="mobileFollower"
        :action-value="'pause'"
        :image-src="'/src/assets/img/mediaPlayer/media-pause-icon.svg'"
        :inactive-image-src="'/src/assets/img/mediaPlayer/media-pause-icon-non.svg'"
        :loading="loading"
        :requested="requestedAction"
        :send-action="() => sendVideoAction(REQUESTS.VIDEOACTIONPAUSE)"
    />
  </div>
</template>
