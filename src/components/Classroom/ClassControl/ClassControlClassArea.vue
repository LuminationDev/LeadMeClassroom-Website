<script setup lang="ts">
import { ref } from "vue";
import settingsIconUrl from '/src/assets/img/settings-icon-cog.svg';
import accountIconUrl from '/src/assets/img/sideMenu/menu-icon-account.svg';
import logoutIconUrl from '/src/assets/img/sideMenu/menu-icon-logout.svg';
import { useClassroomStore } from "@/stores/classroomStore";
import { usePopupStore} from "@/stores/popupStore";

const classroomPinia = useClassroomStore();
const popupPinia = usePopupStore();
const open = ref(false);

const logout = () => {
  classroomPinia.endSession();
  popupPinia.handleLogoutClick();
  location.reload();
}
</script>

<template>
  <div class="mt-20 px-3 lg:px-5 lg:px-10 sticky top-0 w-full py-4 bg-panel-background">
    <div class="flex flex-row justify-between items-center">
      <p class="text-3xl lg:ml-5 font-medium" v-if="classroomPinia.user">{{
          classroomPinia.user?.displayName
        }}'{{ classroomPinia?.user?.displayName?.endsWith('s') ? '' : 's' }} Class</p>

      <!--Settings drop down-->
      <div class="flex flex-col">
        <Teleport to="body">
          <img v-on:click="open = !open" class="w-9 cursor-pointer absolute right-5 lg:right-10 top-10 sm:top-24 z-30" :src="settingsIconUrl" alt="Icon"/>

          <Transition name="fade" mode="out-in">
            <div v-if="open" v-on:click="open = false" class="bg-transparent absolute h-screen w-screen top-0 left-0 z-20">
              <div class="w-44 h-28 flex flex-col absolute right-4 lg:right-9 top-36 bg-gray-200 rounded-lg">
                <!--Gray tip-->
                <div class="ml-36 pl-1 h-0 w-0 border-x-8 border-x-transparent border-b-[16px] border-b-gray-200 -mt-3.5"></div>

                <div class="ml-2 mt-2.5">
                  <!--Navigate to the account page-->
                  <router-link class="w-40 h-10 flex flex-row
                    items-center rounded-lg bg-white text-lg
                    font-semibold hover:bg-gray-300" to="/account"
                    v-on:click="classroomPinia.view = 'settings'">
                    <img class="w-6 h-6 mx-3" :src="accountIconUrl" alt="Icon"/>

                    Settings
                  </router-link>

                  <!--End the active session and logout-->
                  <div class="w-40 h-10 mt-2.5 flex flex-row
                    items-center rounded-lg bg-white text-lg
                    font-semibold text-red-600 cursor-pointer
                    hover:bg-gray-300"
                    v-on:click="logout">
                    <img class="w-6 h-6 mx-3" :src="logoutIconUrl" alt="Icon"/>
                    Log Out
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </Teleport>
      </div>
    </div>
  </div>
</template>
