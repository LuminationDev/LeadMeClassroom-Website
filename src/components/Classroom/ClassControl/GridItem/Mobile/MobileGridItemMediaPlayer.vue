<script setup lang="ts">
import * as REQUESTS from "@/constants/_requests";
import { useClassroomStore } from "@/stores/classroomStore";
import { computed, ref } from "vue";
import type { PropType } from "vue";
import type { MobileFollower } from "@/models";
import MediaButton from "@/components/Buttons/MediaButton.vue";
import stopIcon from '/src/assets/img/mediaPlayer/media-stop-icon.svg'
import stopIconNon from '/src/assets/img/mediaPlayer/media-stop-icon-non.svg'
import playIcon from '/src/assets/img/mediaPlayer/media-play-icon.svg'
import playIconNon from '/src/assets/img/mediaPlayer/media-play-icon-non.svg'
import pauseIcon from '/src/assets/img/mediaPlayer/media-pause-icon.svg'
import pauseIconNon from '/src/assets/img/mediaPlayer/media-pause-icon-non.svg'

const classroomPinia = useClassroomStore();

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

  classroomPinia.requestIndividualAction(
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
      :image-src="stopIcon"
      :inactive-image-src="stopIconNon"
      :loading="loading"
      :requested="requestedAction"
      :send-action="() => sendVideoAction(REQUESTS.VIDEOACTIONSTOP)"
    />

    <!--Play button-->
    <MediaButton
        :mobile-follower="mobileFollower"
        :action-value="'play'"
        :image-src="playIcon"
        :inactive-image-src="playIconNon"
        :loading="loading"
        :requested="requestedAction"
        :send-action="() => sendVideoAction(REQUESTS.VIDEOACTIONPLAY)"
    />

    <!--Pause button-->
    <MediaButton
        :mobile-follower="mobileFollower"
        :action-value="'pause'"
        :image-src="pauseIcon"
        :inactive-image-src="pauseIconNon"
        :loading="loading"
        :requested="requestedAction"
        :send-action="() => sendVideoAction(REQUESTS.VIDEOACTIONPAUSE)"
    />
  </div>
</template>
