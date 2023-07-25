<script setup lang="ts">
import ActionBarBase from "@/components/ActionBar/ActionBarBase.vue";
import shareContentIconUrl from '/src/assets/img/sideMenu/menu-icon-sharecontent.svg';
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import UnlockIcon from "@/assets/vue/UnlockIcon.vue";
import LockIcon from "@/assets/vue/LockIcon.vue";
import { computed } from "vue";
import RemoveIcon from "@/assets/vue/RemoveIcon.vue";
import UnmuteIcon from "@/assets/vue/UnmuteIcon.vue";
import MuteIcon from "@/assets/vue/MuteIcon.vue";
import ActionBarItem from "@/components/ActionBar/ActionBarItem.vue";
import CircleCrossIcon from "@/assets/vue/CircleCrossIcon.vue";
import ClearIcon from "@/assets/vue/Content/ClearIcon.vue";
import ActionBarItemReverse from "@/components/ActionBar/ActionBarItemReverse.vue";

const classroomPinia = useClassroomStore();
const actionPinia = useActionStore();

const shareContent = () => {
  actionPinia.showModal = true;
}

const clearTaskList = () => {
  actionPinia.selectedFollowers.forEach(follower => {
    follower.clearTasks();
    classroomPinia.updateFollowerTasks(follower.getUniqueId(), [], follower.type);
  });
}

const calcLock = computed(() => {
  const lockedCount = actionPinia.selectedFollowers.filter(follower => follower.locked).length;
  return lockedCount < actionPinia.selectedFollowers.length;
});
const lockedText = computed(() => {
  const isSelectedMultiple = actionPinia.selectedFollowers.length > 1;
  const lockText = isSelectedMultiple ? 'Lock Screens' : 'Lock Screen';
  const unlockText = isSelectedMultiple ? 'Unlock Screens' : 'Unlock Screen';

  return calcLock.value ? lockText : unlockText;
});
const lockScreens = () => {
  //Stop the value from changing while in the forEach loop
  const finalLock = calcLock.value;

  actionPinia.selectedFollowers.forEach(follower => {
    classroomPinia.lockScreens(follower, finalLock);
  });
}

const calcSound = computed(() => {
  const lockedCount = actionPinia.selectedFollowers.filter(follower => follower.muted).length;
  return lockedCount < actionPinia.selectedFollowers.length;
});
const soundText = computed(() => {
  const isSelectedMultiple = actionPinia.selectedFollowers.length > 1;
  const muteText = isSelectedMultiple ? 'Mute Devices' : 'Mute Device';
  const unmuteText = isSelectedMultiple ? 'Unmute Devices' : 'Unmute Device';

  return calcSound.value ? muteText : unmuteText;
});
const muteSound = () => {
  //Stop the value from changing while in the forEach loop
  const finalSound= calcSound.value;

  actionPinia.selectedFollowers.forEach(follower => {
    classroomPinia.muteSound(follower, finalSound);
  });
}

const removeUser = () => {
  actionPinia.selectedFollowers.forEach(follower => {
    //Deselect the follower if selected
    actionPinia.handleFollowerSelection(follower, false);
    //Remove the follower
    classroomPinia.endIndividualSession(follower.getUniqueId(), follower.type);
  });
}

const cancel = () => {
  //Open the share content model
  actionPinia.selectedFollowers = [];
}
</script>

<template>
  <ActionBarBase>
    <template v-slot:left>
      <div class="flex flex-row [&>*]:mr-2">
        <ActionBarItem v-on:click="shareContent" :text="'Share Content'">
          <img class="w-5 h-5 2xl:mr-1" :src="shareContentIconUrl" alt="Icon"/>
        </ActionBarItem>

        <ActionBarItem v-on:click="clearTaskList" :text="'Clear Tasks'">
          <ClearIcon class="w-5 h-5 2xl:mr-2" :colour="'white'"/>
        </ActionBarItem>

        <ActionBarItem v-on:click="lockScreens" :text="lockedText">
          <UnlockIcon v-if="calcLock" class="h-5" :colour="'white'"/>
          <LockIcon v-else class="h-5" :colour="'white'"/>
        </ActionBarItem>

        <ActionBarItem v-on:click="muteSound" :text="soundText">
          <UnmuteIcon v-if="calcSound" class="h-5" :colour="'white'"/>
          <MuteIcon v-else class="h-5" :colour="'white'"/>
        </ActionBarItem>

        <ActionBarItem v-on:click="removeUser" :text="actionPinia.selectedItems.length > 1 ? 'Remove Users' : 'Remove User'">
          <RemoveIcon :colour="'white'"/>
        </ActionBarItem>
      </div>
    </template>

    <template v-slot:right>
      <ActionBarItemReverse v-on:click="cancel" :text="'Cancel'">
        <CircleCrossIcon :colour="'white'"/>
      </ActionBarItemReverse>
    </template>
  </ActionBarBase>
</template>
