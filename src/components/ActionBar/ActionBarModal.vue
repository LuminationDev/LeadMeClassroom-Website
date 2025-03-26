<script setup lang="ts">
import * as REQUESTS from "../../constants/_requests";
import ActionBarBase from "@/components/ActionBar/ActionBarBase.vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import { computed } from "vue";
import type { PropType } from 'vue'
import type { Follower } from "@/models";
import UnlockIcon from "@/assets/vue/UnlockIcon.vue";
import LockIcon from "@/assets/vue/LockIcon.vue";
import MuteIcon from "@/assets/vue/MuteIcon.vue";
import UnmuteIcon from "@/assets/vue/UnmuteIcon.vue";
import EyeIcon from "@/assets/vue/EyeIcon.vue";
import RemoveIcon from "@/assets/vue/RemoveIcon.vue";
import ActionBarItem from "@/components/ActionBar/ActionBarItem.vue";
import ActionBarItemReverse from "@/components/ActionBar/ActionBarItemReverse.vue";
import ShareContentIcon from "@/assets/vue/ShareContentIcon.vue";

const emit = defineEmits<{
  (e: 'screenMonitor'): void
  (e: 'close'): void
}>()

const props = defineProps({
  follower: {
    type: Object as PropType<Follower>,
    required: true,
  },
});

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();

const shareContent = () => {
  //Select the current user
  actionPinia.handleFollowerSelection(props.follower, true);

  //Close the Student Detail modal
  emit('close');

  //Open the share content modal
  actionPinia.showModal = true;
}

/**
 * Force a mobile device back to the companion application.
 * NOTE: Only used for Mobile followers.
 */
const returnHome = () => {
  classroomPinia.requestActiveMedia(
      props.follower.getUniqueId(),
      { type: REQUESTS.FORCEACTIVEAPP, action: REQUESTS.MOBILE_PACKAGE },
      REQUESTS.MOBILE
  );
}

/**
 * Close the details modal and open the screen monitor modal for the selected follower.
 * NOTE: Only used for Web followers.
 */
const viewScreen = () => {
  //Close the Student Detail modal
  emit('close');

  //Open the screen monitor modal
  emit('screenMonitor');
}

/**
 * Lock or unlock a users screen, a web user will have their current tabs blacked out by a div, any new tabs will
 * immediately be blacked out as well. A mobile device will have the full screen blocked from use.
 */
const lockScreens = () => {
  classroomPinia.lockScreens(props.follower, !props.follower.locked);
}

/**
 * Mute or unmute the follower's device, a web user will have all tabs muted while a mobile user will have the device
 * itself muted. Depending on the saved muted value on the follower model the command will send a mute or unmute command.
 */
const muteSound = () => {
  classroomPinia.muteSound(props.follower, !props.follower.muted);
}

/**
 * Remove the follower from the class and close the modal.
 */
const removeUser = () => {
  //Deselect the follower if selected
  actionPinia.handleFollowerSelection(props.follower, false);

  //Close the Student Detail modal
  emit('close');

  //Remove the follower
  classroomPinia.endIndividualSession(props.follower.getUniqueId(), props.follower.type);
}

const lockedText = computed(() => {
  return props.follower.locked ? 'Unlock Screen' : 'Lock Screen';
});

const soundText = computed(() => {
  return props.follower.muted ? 'Unmute Sound' : 'Mute Sound';
});
</script>

<template>
  <ActionBarBase>
    <template v-slot:left>
      <div class="flex flex-row [&>*]:mr-2">
        <ActionBarItem v-on:click="shareContent" :text="'Share Content'">
          <ShareContentIcon class="h-5" :colour="'white'"/>
        </ActionBarItem>

        <ActionBarItem v-if="follower.type === REQUESTS.WEB" v-on:click="viewScreen" :text="'View Screen'">
          <EyeIcon :colour="'white'"/>
        </ActionBarItem>

        <ActionBarItem v-if="follower.type === REQUESTS.MOBILE" v-on:click="returnHome" :text="'Return Home'">
          <img class="h-5" src="/src/assets/img/media-application.svg" alt="Icon"/>
        </ActionBarItem>

        <ActionBarItem v-on:click="lockScreens" :text="lockedText">
          <UnlockIcon v-if="follower.locked" class="h-5" :colour="'white'"/>
          <LockIcon v-else class="h-5" :colour="'white'"/>
        </ActionBarItem>

        <ActionBarItem v-on:click="muteSound" :text="soundText">
          <UnmuteIcon v-if="follower.muted" class="h-5" :colour="'white'"/>
          <MuteIcon v-else class="h-5" :colour="'white'"/>
        </ActionBarItem>
      </div>
    </template>

    <template v-slot:right>
      <div class="flex flex-row items-center">
        <ActionBarItemReverse v-on:click="removeUser" :text="actionPinia.selectedItems.length > 1 ? 'Remove Users' : 'Remove User'">
          <RemoveIcon :colour="'white'"/>
        </ActionBarItemReverse>
      </div>
    </template>
  </ActionBarBase>
</template>
