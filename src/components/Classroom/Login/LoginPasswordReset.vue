<script setup lang="ts">
import AccountInput from "../../InputFields/AccountInput.vue";
import emailFaded from '/src/assets/img/login/login-icon-email-fade.svg';
import emailActive from '/src/assets/img/login/login-icon-email-active.svg';
import emailSolid from '/src/assets/img/login/login-icon-email-solid.svg';
import { ref } from "vue";
import useVuelidate from "@vuelidate/core";
import {required, email as emailRule, helpers} from "@vuelidate/validators";

import GenericButton from "../../Buttons/GenericButton.vue";
import {getAuth, sendPasswordResetEmail} from "@firebase/auth";

const emit = defineEmits<{
  (e: 'changeView', newView: string): void
  (e: 'passwordReset', value: boolean): void
}>()

const email = ref("")
const error = ref("")

const rules = {
  email: {
    required: helpers.withMessage("Email is required", required),
    emailRule: helpers.withMessage("Email must be a valid email address", emailRule),
    $lazy: true,
    $autoDirty: false
  }
}

const v$ = useVuelidate(rules, { email })

async function validateAndSubmit() {
  const result = await v$.value.$validate();
  if (!result) { return; }

  const auth = getAuth();
  await sendPasswordResetEmail(auth, email.value)
      .then(() => {
        emit('passwordReset', true)
        emit('changeView', 'login')
      })
      .catch((response) => {
        const errorCode = response.code;
        console.log(errorCode);

        error.value = response.code
        // todo
        // this.error = this.getUsefulErrorMessageFromFirebaseCode(error.code)
      });
}
</script>

<template>
  <div>
    <div class="flex flex-col items-center">
      <img
          class="w-8 h-8 mb-8"
          src="/src/assets/img/icon-128.png"
          alt="header icon" />
    </div>

    <p class="text-left w-64 text-white text-sm mb-3">Enter the email address associated with your account.</p>

    <form
      class="pb-5 flex flex-col"
      @submit.prevent>

      <div class="mb-2">
        <AccountInput
            class="mb-2"
            :faded-src="emailFaded"
            :active-src="emailActive"
            :solid-src="emailSolid"
            v-model="email"
            :v$="v$.email"
            placeholder="Email"
            alt="Email"/>
        <p class="text-red-400">{{ error }}</p>
      </div>

      <GenericButton
          class="mb-4 h-11 text-white text-sm"
          :type="'secondary'"
          :callback="validateAndSubmit"
      >Reset Password</GenericButton>

      <p class="pb-5 cursor-pointer text-blue-400 text-sm"
         v-on:click="$emit('changeView', 'login')"
      >Back to Login</p>
    </form>
  </div>
</template>
