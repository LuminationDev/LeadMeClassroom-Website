<script setup lang="ts">
import ActionBarBase from "@/components/ActionBar/ActionBarBase.vue";
import selectIconUrl from '/src/assets/img/selection-icon-individual.svg';
import shareContentIconUrl from '/src/assets/img/sideMenu/menu-icon-sharecontent.svg';
import { useClassroomStore } from "@/stores/classroomStore";
import { useActionStore } from "@/stores/actionStore";
import UnlockIcon from "@/assets/vue/UnlockIcon.vue";
import LockIcon from "@/assets/vue/LockIcon.vue";
import { computed } from "vue";
import RemoveIcon from "@/assets/vue/RemoveIcon.vue";
import UnmuteIcon from "@/assets/vue/UnmuteIcon.vue";
import MuteIcon from "@/assets/vue/MuteIcon.vue";

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

  console.log(finalSound);

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

const selectAll = () => {
  //Select all users
  classroomPinia.mobileFollowers.forEach(follower => {
    actionPinia.handleFollowerSelection(follower, true);
  });

  classroomPinia.webFollowers.forEach(follower => {
    actionPinia.handleFollowerSelection(follower, true);
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
        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
          v-on:click="shareContent"
        >
          <img class="w-5 h-5 mr-1" :src="shareContentIconUrl" alt="Icon"/>
          Share Content
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="clearTaskList"
        >
          <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
          Clear Tasks
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="lockScreens"
        >
          <UnlockIcon v-if="calcLock" class="h-5" :colour="'white'"/>
          <LockIcon v-else class="h-5" :colour="'white'"/>
          <span class="ml-1">{{lockedText}}</span>
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="muteSound"
        >
          <UnmuteIcon v-if="calcSound" class="h-5" :colour="'white'"/>
          <MuteIcon v-else class="h-5" :colour="'white'"/>
          <span class="ml-1">{{soundText}}</span>
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="removeUser"
        >
          <RemoveIcon :colour="'white'"/>
          <span class="ml-1">Remove User<span v-if="actionPinia.selectedItems.length > 1">s</span></span>
        </div>
      </div>
    </template>

    <template v-slot:right>
      <div class="flex flex-row items-center">
        <div class="text-white mr-2">
          {{actionPinia.selectedFollowers.length}} Selected
        </div>

        <div class="h-9 flex items-center pl-3 pr-4 rounded-3xl text-base
        text-white cursor-pointer bg-blue-400 hover:bg-blue-300"
             v-on:click="selectAll"
        >
          Select All
        </div>

        <div class="h-9 flex items-center ml-2 pl-3 pr-4 rounded-3xl text-base
          text-white cursor-pointer bg-gray-400 hover:bg-gray-300"
          v-on:click="cancel"
        >
          Cancel
        </div>
      </div>
    </template>
  </ActionBarBase>
</template>
