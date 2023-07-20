<script setup lang="ts">
import * as REQUESTS from "../../constants/_requests";
import ActionBarBase from "@/components/ActionBar/ActionBarBase.vue";
import shareContentIconUrl from '/src/assets/img/sideMenu/menu-icon-sharecontent.svg';
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import { computed, defineProps, PropType } from "vue";
import { Follower } from "@/models";
import UnlockIcon from "@/assets/vue/UnlockIcon.vue";
import LockIcon from "@/assets/vue/LockIcon.vue";
import MuteIcon from "@/assets/vue/MuteIcon.vue";
import UnmuteIcon from "@/assets/vue/UnmuteIcon.vue";
import EyeIcon from "@/assets/vue/EyeIcon.vue";
import RemoveIcon from "@/assets/vue/RemoveIcon.vue";

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
        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
          v-on:click="shareContent"
        >
          <img class="w-5 h-5 mr-1" :src="shareContentIconUrl" alt="Icon"/>
          Share Content
        </div>

        <div v-if="follower.type === REQUESTS.WEB" class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="viewScreen"
        >
          <EyeIcon :colour="'white'"/>
          <span class="ml-1">View Screen</span>
        </div>

        <div v-if="follower.type === REQUESTS.MOBILE" class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="returnHome"
        >
          <img class="w-5 h-5" src="src/assets/img/media-application.svg" alt="Icon"/>
          <span class="ml-1">Return Home</span>
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="lockScreens"
        >
          <div  class="flex flex-row items-center">
            <UnlockIcon v-if="follower.locked" class="h-5" :colour="'white'"/>
            <LockIcon v-else class="h-5" :colour="'white'"/>
            <span class="ml-1">{{lockedText}}</span>
          </div>
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="muteSound"
        >
          <UnmuteIcon v-if="follower.muted" class="h-5" :colour="'white'"/>
          <MuteIcon v-else class="h-5" :colour="'white'"/>
          <span class="ml-1">{{soundText}}</span>
        </div>
      </div>
    </template>

    <template v-slot:right>
      <div class="flex flex-row items-center">
        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-gray-400 hover:bg-gray-300"
             v-on:click="removeUser"
        >
          <RemoveIcon :colour="'white'"/>
          <div class="ml-1">
            Remove User<span v-if="actionPinia.selectedItems.length > 1">s</span>
          </div>
        </div>
      </div>
    </template>
  </ActionBarBase>
</template>
