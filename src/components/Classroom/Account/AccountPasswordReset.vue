<script setup lang="ts">
import {ref} from "vue";
import {email as emailRule, helpers, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import AccountInput from "@/components/InputFields/AccountInput.vue";
import GenericButton from "@/components/Buttons/GenericButton.vue";
import emailFaded from '/src/assets/img/login/login-icon-email-fade.svg';
import emailActive from '/src/assets/img/login/login-icon-email-active.svg';
import emailSolid from '/src/assets/img/login/login-icon-email-solid.svg';
import { useClassroomStore } from "@/stores/classroomStore";

defineEmits<{
  (e: 'changeView', newView: string): void
}>()

const props = defineProps({
  email: {
    type: String,
    required: true,
  },
});

const classroomPinia = useClassroomStore();
const email = ref(props.email);
const response = ref('');
const error = ref('');
const changed = ref(false);
const rules = {
  email: {
    required: helpers.withMessage("Email is required", required),
    emailRule: helpers.withMessage("Email must be a valid email address", emailRule),
    $lazy: true
  }
}

const v$ = useVuelidate(rules, { email })

async function validateEmail() {
  const result = await v$.value.email.$validate();
  if (!result) { return; }

  const success = await classroomPinia.handlePasswordReset(email.value);
  if(success !== 'success') {
    error.value = success;
    return;
  }

  error.value = '';
  response.value = 'We have sent a password recovery link to your email.';
  email.value = '';
  v$.value.$reset();
  resetChanged();
}

function resetChanged() {
  changed.value = true;
  setTimeout(() => { changed.value = false; }, 2000);
}
</script>

<template>
  <!--Forgot password area-->
  <div>
    <p class="text-sm text-gray-400 font-semibold mb-3">Reset Password</p>
    <p class="text-sm text-gray-400 mb-3">Enter the email address associated with your account.</p>

    <!--Account email-->
    <AccountInput
        class="mb-2"
        :faded-src="emailFaded"
        :active-src="emailActive"
        :solid-src="emailSolid"
        v-model="email"
        :v$="v$.email"
        placeholder="Email"
        alt="Email"/>

    <p class="w-64 px-1 text-red-800 text-sm mb-3">{{ error }}</p>
    <p class="w-64 px-1 text-green-400 text-sm mb-3">{{ response }}</p>

    <GenericButton class="flex justify-center items-center text-white h-11 text-sm" :type="'primary'" :callback="validateEmail">
      <img v-if="changed" class="w-8 h-8" src="/src/assets/img/tick.svg" alt="Icon"/>
      <p v-else>Reset Password</p>
    </GenericButton>

    <p
        class="mb-3 font-medium text-sm text-blue-400 cursor-pointer"
        v-on:click="$emit('changeView', 'changePassword')"
    >Change Password?</p>
  </div>
</template>
