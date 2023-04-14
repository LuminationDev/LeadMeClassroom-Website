<script setup lang="ts">
import EmailInput from "../../InputFields/EmailInput.vue";
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
  <form
    class="pb-5 flex flex-col items-center"
    @submit.prevent>
    <p class="mt-2 mb-9 w-56">Enter the email address associated with your account.</p>

    <div class="mb-4">
      <EmailInput v-model="email" :v$="v$.email" placeholder="Email" />
      <p class="text-red-400">{{ error }}</p>
    </div>

    <GenericButton class="mb-14" :type="'secondary'" :callback="validateAndSubmit">Submit</GenericButton>
  </form>

  <p class="pb-5 text-gray-separator cursor-pointer"
     v-on:click="$emit('changeView', 'login')"
  >Teacher Login</p>
</template>
