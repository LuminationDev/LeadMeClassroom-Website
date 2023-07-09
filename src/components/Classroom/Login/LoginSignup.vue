<script setup lang="ts">
import GenericButton from "../../Buttons/GenericButton.vue";
import AccountInput from "../../InputFields/AccountInput.vue";
import emailFaded from '/src/assets/img/login/login-icon-email-fade.svg';
import emailActive from '/src/assets/img/login/login-icon-email-active.svg';
import emailSolid from '/src/assets/img/login/login-icon-email-solid.svg';
import nameFaded from '/src/assets/img/login/login-icon-person-faded.svg';
import nameActive from '/src/assets/img/login/login-icon-person-active.svg';
import nameSolid from '/src/assets/img/login/login-icon-person-solid.svg';
import { ref, computed } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, email as emailRule, sameAs, helpers, minLength } from "@vuelidate/validators";
import { createUserWithEmailAndPassword, getAuth, sendEmailVerification, updateProfile } from "@firebase/auth";
import PasswordInput from "@/components/InputFields/PasswordInput.vue";

const emit = defineEmits<{
  (e: 'changeView', newView: string): void
  (e: 'registered', value: boolean): void
}>()

const error = ref("");
const password = ref("");
const email = ref("");
const name = ref("");
const marketing = ref(false);
const terms = ref(false);

const rules = {
  password: {
    required: helpers.withMessage("Password is required", required),
    minLength: helpers.withMessage("Password must be at least 8 characters", minLength(8)),
    specialCharacters: helpers.withMessage("Password must have a special character", helpers.regex(/^(?=.*[*.!@#$%^&(){}[\]:;<>,?/~_+\-=|]).*$/)),
    lowerCase: helpers.withMessage("Password must have a lowercase letter", helpers.regex(/^(?=.*[a-z]).*$/)),
    upperCase: helpers.withMessage("Password must have an uppercase letter", helpers.regex(/^(?=.*[A-Z]).*$/)),
    numbers: helpers.withMessage("Password must have at least one number", helpers.regex(/^(?=.*[0-9]).*$/))
  },
  email: {
    required: helpers.withMessage("Email is required", required),
    emailRule: helpers.withMessage("Email must be a valid email address", emailRule),
    $lazy: true
  },
  name: {
    required: helpers.withMessage("Name is required", required),
    $autoDirty: true
  },
  terms: {
    required: helpers.withMessage("You must accept the terms and conditions", required),
    sameAs: helpers.withMessage("You must accept the terms and conditions", sameAs(true))
  }
}

const v$ = useVuelidate(rules, { password, email, name, terms })

const termsModel = computed({
  get() {
    return !!v$.value.terms.$model
  },
  set(newValue) {
    // @ts-ignore
    v$.value.terms.$model = newValue
  }
})

async function validateInputs() {
  const result = await v$.value.$validate();
  if (!result) { return; }
  const auth = getAuth();
  await createUserWithEmailAndPassword(auth, email.value, password.value)
      .then((user) => {
        //Set the display name of the user
        updateProfile(auth.currentUser!, { displayName: name.value, photoURL: marketing.value ? Date.now().toString() : null })
            .catch((err) => console.log(err));
        sendEmailVerification(user.user)
            .catch((err) => console.log(err));
        // Move to sign in
        emit('registered', true)
        emit('changeView', 'verify')
      })
      .catch((error) => {
        const errorCode = error.code;
        console.log(errorCode);

        // todo
        // error.value = getUsefulErrorMessageFromFirebaseCode(error.code)
      });

  email.value = ''
  password.value = ''
  v$.value.$reset()
}
</script>

<template>
  <div>
    <div class="flex flex-col items-center">
      <img
          class="w-8 h-8 mb-10"
          src="/src/assets/img/icon-128.png"
          alt="header icon" />
    </div>

    <form @submit.prevent class="pb-7">
      <div>
        <AccountInput
            class="mb-2"
            :faded-src="nameFaded"
            :active-src="nameActive"
            :solid-src="nameSolid"
            v-model="name"
            :v$="v$.name"
            placeholder="Name"
            alt="Name"/>

        <AccountInput
            class="mb-2"
            :faded-src="emailFaded"
            :active-src="emailActive"
            :solid-src="emailSolid"
            v-model="email"
            :v$="v$.email"
            placeholder="Email"
            alt="Email"/>
        <PasswordInput class="mb-2" placeholder="Password" :v$="v$.password" v-model="password"/>
        <p class="text-red-400">{{ error }}</p>
      </div>

      <div class="mt-5 mb-4 flex items-start flex-col">
        <label class="inline-flex items-center">
          <input class="w-4 h-4" type="checkbox" v-model="termsModel"/>
          <span class="w-56 ml-4 text-xsm text-left text-gray-300">
            By signing up, I agree to LeadMe's
            <a
                target="_blank"
                href="https://leadmeprivacypolicies.herokuapp.com/policies/classroom"
                class="underline text-gray-300 underline-offset-1"
            >Terms and Conditions</a></span>
        </label>

        <div class="ml-8 w-52 mt-1 text-start text-xsm" v-if="v$.terms && v$.terms.$error">
          <span class="text-red-800" v-for="(error, index) in v$.terms.$errors" :key="index">{{ error.$message }}</span>
        </div>
      </div>

      <label class="inline-flex items-center mb-5">
        <input class="w-4 h-4" type="checkbox" v-model="marketing"/>
        <span class="w-56 ml-4 text-xsm text-left text-gray-300">I want to receive emails about product updates, new features and offerings from LeadMe!</span>
      </label>

      <div>
        <GenericButton
            class="h-11 text-white"
            :type="'secondary'"
            :callback="validateInputs"
        >Sign up</GenericButton>

        <p class="text-red-400">{{ error }}</p>

        <p class="mt-3 cursor-pointer text-blue-400 text-sm font-medium" v-on:click="$emit('changeView', 'login')">
          Sign in instead?
        </p>
      </div>
    </form>
  </div>
</template>
