<script setup lang="ts">
import { ref } from "vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { helpers, minLength, required} from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import PasswordInput from "@/components/InputFields/PasswordInput.vue";
import GenericButton from "@/components/Buttons/GenericButton.vue";

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
const oldPassword = ref('');
const password = ref('');
const confirmPassword = ref('');
const response = ref('');
const error = ref('');
const changed = ref(false);
const rules = {
  oldPassword: {
    required: helpers.withMessage("Current password is required", required),
    $autoDirty: true
  },
  password: {
    required: helpers.withMessage("Password is required", required),
    minLength: helpers.withMessage("Password must be at least 8 characters", minLength(8)),
    specialCharacters: helpers.withMessage("Password must have a special character", helpers.regex(/^(?=.*[*.!@#$%^&(){}[\]:;<>,?/~_+\-=|]).*$/)),
    lowerCase: helpers.withMessage("Password must have a lowercase letter", helpers.regex(/^(?=.*[a-z]).*$/)),
    upperCase: helpers.withMessage("Password must have an uppercase letter", helpers.regex(/^(?=.*[A-Z]).*$/)),
    numbers: helpers.withMessage("Password must have at least one number", helpers.regex(/^(?=.*[0-9]).*$/))
  },
}

const v$ = useVuelidate(rules, { oldPassword, password })

async function validatePassword() {
  // Validate the passwords
  const oldResult = await v$.value.oldPassword.$validate();
  const passwordResult = await v$.value.password.$validate();
  if (!oldResult || !passwordResult) { return; }

  // Confirm the new and confirm passwords are the same
  if (password.value !== confirmPassword.value) {
    error.value = "New passwords must match."
    return;
  }

  const result = await classroomPinia.changeUserPassword(props.email, oldPassword.value, password.value);
  if(result !== 'success') {
    error.value = result;
    return;
  }

  error.value = '';
  response.value = 'Your password has been updated!';
  oldPassword.value = '';
  password.value = '';
  v$.value.$reset();
  resetChanged();
}

function resetChanged() {
  changed.value = true;
  setTimeout(() => { changed.value = false; }, 2000);
}
</script>

<template>
  <!--Change password area-->
  <div>
    <p class="text-sm text-gray-400 font-semibold mb-3">Change Password</p>

    <!--Old password-->
    <PasswordInput class="mb-2" v-model="oldPassword" :v$="v$.oldPassword" placeholder="Old Password"/>

    <!--New password-->
    <PasswordInput class="mb-2" v-model="password" :v$="v$.password" v-on:focusin="changed = false" placeholder="New Password"/>

    <!--Confirm New password-->
    <PasswordInput v-model="confirmPassword" :v$="v$.password" :show-error="false" v-on:focusin="changed = false" placeholder="Confirm New Password"/>

    <p class="w-64 px-1 text-red-800 text-sm mb-3">{{ error }}</p>
    <p class="w-64 px-1 text-green-400 text-sm mb-3">{{ response }}</p>

    <GenericButton class="flex justify-center items-center text-white h-11 text-sm" :type="'primary'" :callback="validatePassword">
      <img v-if="changed" class="w-8 h-8" src="/src/assets/img/tick.svg" alt="Icon"/>
      <p v-else>Change Password</p>
    </GenericButton>

    <p
        class="mb-3 font-medium text-sm text-blue-400 cursor-pointer"
        v-on:click="$emit('changeView', 'resetPassword')"
    >Forgot Password?</p>
  </div>
</template>
