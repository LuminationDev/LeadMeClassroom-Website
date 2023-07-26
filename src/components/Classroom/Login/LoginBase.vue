<script setup lang="ts">
import { ref } from "vue";
import LoginInitial from "@/components/Classroom/Login/LoginInitial.vue";
import LoginTeacher from "@/components/Classroom/Login/LoginTeacher.vue";
import LoginStudent from "@/components/Classroom/Login/LoginStudent.vue";
import LoginPasswordReset from "@/components/Classroom/Login/LoginPasswordReset.vue";
import LoginSignup from "@/components/Classroom/Login/LoginSignup.vue";
import LoginVerifyEmail from "@/components/Classroom/Login/LoginVerifyEmail.vue";

const currentView = ref("welcome")
const justPasswordReset = ref(false)
const justRegistered = ref(false)
function setView(newView: string) {
  currentView.value = newView
  if (newView !== 'login') {
    setPasswordReset(false)
    setJustRegistered(false)
  }
}

function setPasswordReset(value: boolean) {
  justPasswordReset.value = value
}

function setJustRegistered(value: boolean) {
  justRegistered.value = value
}
</script>

<template>
  <div class="w-full bg-navy-side-menu h-full flex justify-center items-center">
    <div class="p-16 rounded-xl">
      <LoginInitial v-if="currentView === 'welcome'" @change-view="setView" />

      <LoginTeacher v-else-if="currentView === 'login'" @change-view="setView">
        <template #messages>
          <div v-if="justRegistered">
            Just registered, now signup
          </div>
          <div v-if="justPasswordReset">
            Just reset, go to your email
          </div>
        </template>
      </LoginTeacher>

      <LoginStudent v-else-if="currentView === 'student'" @change-view="setView" />

      <LoginSignup v-else-if="currentView === 'register'"
                   @change-view="setView"
                   @registered="setJustRegistered"
      />

      <LoginPasswordReset v-else-if="currentView === 'reset'"
                          @change-view="setView"
                          @password-reset="setPasswordReset"
      />

      <LoginVerifyEmail v-else-if="currentView === 'verify'" @change-view="setView" />
    </div>
  </div>
</template>
