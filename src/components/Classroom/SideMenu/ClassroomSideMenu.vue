<script setup lang="ts">
import ClassroomMenuItem from "./ClassroomMenuItem.vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { computed, onBeforeMount, onBeforeUnmount, ref } from "vue";
import classroomIconUrl from '/src/assets/img/sideMenu/menu-icon-classroom.svg';
import endClassIconUrl from '/src/assets/img/sideMenu/menu-icon-endclass.svg';
import GenericButton from "@/components/Buttons/GenericButton.vue";
import ClassroomActions from "@/components/Classroom/SideMenu/ClassroomActions.vue";
import RoomCodeModal from "@/components/Modals/RoomCode/RoomCodeModal.vue";

const classroomPinia = useClassroomStore();

const screenSize = ref(window.innerWidth)
const expanded = ref(screenSize.value >= 1280)

onBeforeMount(() => {
  window.addEventListener('resize', resizeHandler)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeHandler)
})

const resizeHandler = (e: UIEvent) => {
  screenSize.value = (e?.currentTarget as Window)?.innerWidth
  if (screenSize.value >= 1280) {
    expanded.value = true
  } else {
    expanded.value = false
  }
}

const sidebarShouldBeExpanded = computed(() => {
  return expanded.value
})

const classCode = computed(() => {
  return classroomPinia.classCode !== ''
})

async function endSession() {
  await classroomPinia.endSession();
}

async function generateSession() {
  await classroomPinia.generateSession();
}

const hover = ref(false)
</script>

<template>
  <Transition name="fade">
    <div v-if="sidebarShouldBeExpanded" class="xl:hidden absolute w-screen h-screen opacity-80 bg-gray-200 z-20 cursor-pointer" @click="() => { expanded = !expanded }"></div>
  </Transition>
  <div class="fixed top-0 left-0 xl:block xl:relative bg-navy-side-menu z-20 h-screen corner" :class="sidebarShouldBeExpanded ? 'sidebar-expanded' : 'sidebar-closed'" @mouseover="hover = true" @mouseleave="hover = false">
    <div class="xl:hidden absolute top-10 -right-4 cursor-pointer" @click="() => { expanded = !expanded }">
      <img class="w-8 h-8"
           :src="sidebarShouldBeExpanded ? '/src/assets/img/sidebar-close.svg' : '/src/assets/img/sidebar-open.svg'"
           alt="Menu button"/>
    </div>
    <div v-if="hover || !sidebarShouldBeExpanded" class="absolute top-10 -right-4 cursor-pointer" @click="() => { expanded = !expanded }">
      <img class="w-8 h-8"
           :src="sidebarShouldBeExpanded ? '/src/assets/img/sidebar-close.svg' : '/src/assets/img/sidebar-open.svg'"
           alt="Menu button"/>
    </div>
    <div class="flex justify-center items-center">
      <img class="mt-10 mb-6"
          :class="sidebarShouldBeExpanded ? 'w-28 h-10' : 'h-10 w-10'"
           :src="sidebarShouldBeExpanded ? '/src/assets/img/icon-dashboard-logo.svg' : '/src/assets/img/icon-logo.svg'"
           alt="LeadMe Icon"/>
    </div>
    <hr class="mx-5 border border-gray-menu-separator">

    <!--Class Code-->
    <div class="flex flex-col justify-center px-4">
      <div class="mt-5 flex justify-center">
        <RoomCodeModal
            v-if="classCode"
            :class-code="classroomPinia.classCode"/>

        <GenericButton
            v-else
            id="generate_class"
            class="h-12 w-48 bg-violet-500
          text-sm text-white font-poppins font-medium
          rounded-md"
            :callback="generateSession"
        >Start a Class</GenericButton>
      </div>

      <!--Content options-->
      <div class="child:mb-3" :class="sidebarShouldBeExpanded ? 'mt-8' : 'mt-3'">
        <ClassroomMenuItem
            :icon="classroomIconUrl"
            :enabled="classCode" view="/"
            :panel="'classroom'"
            v-on:click="classroomPinia.view = 'classroom'"
        >Classroom</ClassroomMenuItem>

        <ClassroomActions />
      </div>

      <!--End the active session and logout-->
      <ClassroomMenuItem
          :icon="endClassIconUrl" class="fixed bottom-12"
          :enabled="classCode"
          :panel="''"
          v-on:click="endSession()"
          view="/"
      >End Class</ClassroomMenuItem>
    </div>
    </div>
  <div class="xl:hidden w-24 h-screen z-10"></div>
</template>

<style lang="scss">
.sidebar-expanded {
  transition: 0.2s ease-in-out;
  &::before {
    left:13.96rem;
    transition: all 0.2s ease-in-out;
  }
  .menu-item {
    max-width: 12rem;
    .menu-item-text {
      opacity: 1;
      animation: animate 0.2s linear forwards;
      &--room-code {
        @apply text-center
      }
      @apply text-start whitespace-nowrap overflow-hidden
    }
    .menu-item-icon {
      &--room-code {
        display: none;
      }
      @apply mr-3
    }
    &--room-code {
      @apply justify-center
    }
    @apply justify-start w-full items-center px-4 h-12
  }
  @apply w-56
}
.sidebar-closed {
  transition: 0.2s ease-in-out;
  &::before {
    left:5.96rem;
    transition: all 0.2s ease-in-out;
  }
  .menu-item {
    .menu-item-text {
      opacity: 0;
      display: none;
    }
    .menu-item-icon {
      &--spinner {
        @apply h-5 w-5
      }
      @apply mr-0 h-7 w-7
    }
    @apply justify-center w-full items-center px-4 h-16 w-16
  }
  @apply w-24
}
.corner::before {
  content: "";
  position: absolute;
  background-color: transparent;
  height: 25px;
  width: 15px;
  top: 1.5rem;
  border-top-left-radius: 15px;
  box-shadow: 0 -15px 0 0 #182B50;
}
@keyframes animate {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}
</style>