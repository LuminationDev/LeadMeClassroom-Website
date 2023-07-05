<script setup lang="ts">
import PasswordInput from "../../InputFields/PasswordInput.vue";
import GenericButton from "../../Buttons/GenericButton.vue";
import EmailInput from "../../InputFields/EmailInput.vue";
import { ref } from "vue";
import {email as emailRule, helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";

import {getAuth, signInWithEmailAndPassword} from "@firebase/auth";
import {useRouter} from "vue-router";
import {useClassroomStore} from "@/stores/classroomStore";

const classroomPinia = useClassroomStore();

const router = useRouter()

const email = ref("")
const password = ref("")
const error = ref("")

const rules = {
  password: {
    required: helpers.withMessage("Password is required", required)
  },
  email: {
    required: helpers.withMessage("Email is required", required),
    emailRule: helpers.withMessage("Email must be a valid email address", emailRule),
    $lazy: true,
    $autoDirty: false
  }
}

const v$ = useVuelidate(rules, { password, email })

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  if (getAuth().currentUser) {
    if (!getAuth().currentUser?.emailVerified) {
      emit('changeView', 'verify')
    } else {
      classroomPinia.user = getAuth().currentUser
      router.push({ name: 'classroom' })
    }
    return;
  }

  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email.value, password.value)
      .then(() => {
        if (!auth.currentUser?.emailVerified) {
          emit('changeView', 'verify')
        } else {
          classroomPinia.user = auth.currentUser
          router.push({ name: 'classroom' })
        }
      })
      .catch((response) => {
        error.value = getUsefulErrorMessageFromFirebaseCode(response.code)
      });
  v$.value.$reset();
}

function getUsefulErrorMessageFromFirebaseCode(error: string) {
  switch (error) {
    case 'auth/email-already-exists':
    case 'auth/email-already-in-use':
      return 'This email is already in use. Try signing in instead.'
    case 'auth/id-token-expired':
    case 'auth/id-token-revoked':
    case 'auth/invalid-id-token':
      return 'Your login session has expired. Please logout and try again'
    case 'auth/invalid-email':
      return 'This email is invalid. Please check your email address and try again.'
    case 'auth/invalid-password':
      return 'This password is invalid. Please check that it is at least 6 characters.'
    case 'auth/user-not-found':
      return 'No account was found for these login details. Please check your details and try again.'
    case 'auth/wrong-password':
      return 'This password does not match the login details for this account. Please try again.'
    case 'auth/too-many-requests':
      return 'Too many attempts have been made to login to this account. Please reset your password or try again later.'
    default:
      return 'An error has occurred. Please contact support and give them this error code: ' + error
  }
}

const emit = defineEmits<{
  (e: 'changeView', newView: string): void
}>()
</script>

<template>
  <div>
    <div class="flex flex-col items-center">
      <img
          class="w-8 h-8 mb-8"
          src="/src/assets/img/icon-128.png"
          alt="header icon" />

      <p class="text-center mb-4 text-white">Welcome to LeadMe!</p>
    </div>

    <form @submit.prevent class="pb-5">
    <!-- todo <div class="mb-3" v-if="popupPinia.justCreatedAccount">Thanks for signing up, please verify your email and login to get started</div>-->
      <slot name="messages"></slot>
      <div class="mb-2">
        <EmailInput v-model="email" :v$="v$.email" placeholder="Email" />
      </div>

      <div class="mb-3">
        <PasswordInput v-model="password" placeholder="Password" :v$="v$.password"/>
        <p class="text-red-400">{{ error }}</p>
      </div>

      <p
          class="text-right mb-7 text-sm font-medium text-blue-400 cursor-pointer"
          v-on:click="() => { emit('changeView', 'reset') }"
      >
        Forgot password?
      </p>

      <GenericButton
          class="text-white h-11"
          :type="'secondary'"
          :callback="validateAndSubmit"
      >Sign in</GenericButton>

      <div class="mt-4 font-medium">
        <p class="text-gray-separator text-sm">
          New to LeadMe?
          <span class="cursor-pointer text-blue-400" v-on:click="() => { emit('changeView', 'register') }">Sign up</span>
        </p>
      </div>
    </form>
  </div>
</template>
