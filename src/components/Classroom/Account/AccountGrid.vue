<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, helpers, email as emailRule } from "@vuelidate/validators";
import logoutIconUrl from '/src/assets/img/sideMenu/menu-icon-logout.svg';
import TextInput from "../../InputFields/TextInput.vue";
import AccountPasswordReset from "@/components/Classroom/Account/AccountPasswordReset.vue";
import AccountPasswordChange from "@/components/Classroom/Account/AccountPasswordChange.vue";
import GenericButton from "../../Buttons/GenericButton.vue";
import AccountInput from "@/components/InputFields/AccountInput.vue";
import ActionBarBase from "@/components/ActionBar/ActionBarBase.vue";
import AccountChanged from "@/components/Classroom/Account/AccountChanged.vue";
import { useClassroomStore } from "@/stores/classroomStore";
import { usePopupStore } from "@/stores/popupStore";

const classroomPinia = useClassroomStore();
const popupPinia = usePopupStore();

const initialObject = {
  displayName: "",
  email: "",
  marketing: ""
}

const response = reactive({
  displayName: "",
  email: "",
  marketing: ""
});
const error = reactive({
  displayName: "",
  email: "",
  marketing: ""
});
const marketing = ref(classroomPinia.marketing);
const name = ref(classroomPinia.leaderName);
const email = ref(classroomPinia.leaderEmail);
const rules = {
  name: {
    required: helpers.withMessage("Name is required", required),
    $autoDirty: true
  },
  email: {
    required: helpers.withMessage("Email is required", required),
    emailRule: helpers.withMessage("Email must be a valid email address", emailRule),
    $lazy: true
  }
}

const v$ = useVuelidate(rules, { name, email })

const changed = computed(() => {
  return marketing.value !== classroomPinia.marketing
      || name.value !== classroomPinia.leaderName
      || email.value !== classroomPinia.leaderEmail
})

/**
 * Revert any changes made to the settings
 */
function rollbackChanges() {
  marketing.value = classroomPinia.marketing;
  name.value = classroomPinia.leaderName;
  email.value = classroomPinia.leaderEmail;
  clearFields();
}

/**
 * Save the updated display name or email address
 */
async function validateAndSubmit() {
  const nameResult = await v$.value.name.$validate();
  const emailResult = await v$.value.email.$validate();
  if (!nameResult || !emailResult) { return; }

  // Only clear the response/error if there are none
  clearFields();

  // Check if name has been changed
  if (name.value !== classroomPinia.leaderName) {
    const result = await classroomPinia.changeDisplayName(name.value);
    error.displayName = result !== 'success' ? result : '';
    response.displayName = result === 'success' ? 'Successfully updated.' : '';
  }

  // Check if email has been changed
  if (email.value !== classroomPinia.leaderEmail) {
    const result = await classroomPinia.changeEmailAddress(email.value);
    error.email = result !== 'success' ? result : '';
    response.email = result === 'success' ? 'Successfully updated.' : '';
  }

  // Check if marketing has been changed
  if (marketing.value !== classroomPinia.marketing) {
    const result = await classroomPinia.changeMarketingPreference(marketing.value);
    error.marketing = result !== 'success' ? result : '';
    response.marketing = result === 'success' ? 'Successfully updated.' : '';
  }

  //Remove the saved responses after 5 seconds (errors will stay)
  setTimeout(() => {
    Object.assign(response, initialObject);
  }, 5000);
}

function changeView(view: string) {
  rollbackChanges();
  classroomPinia.changeAccountView(view);
}

function clearFields() {
  Object.assign(response, initialObject);
  Object.assign(error, initialObject);
  v$.value.$reset();
}

const logout = () => {
  classroomPinia.endSession();
  popupPinia.handleLogoutClick();
  location.reload();
}
</script>

<template>
  <div class="relative h-full">
    <Transition name="fade" mode="out-in">
      <div v-if="classroomPinia.accountView === 'main'">
        <div class="mb-8">

          <!--Changing display name-->
          <p class="text-sm text-gray-400 font-semibold mb-3">Preferred Name</p>
          <div class="flex flex-row items-center mb-1">
            <TextInput v-model="name" :v$="v$.name" v-on:focusin="changed = false" class="w-64" type="text" placeholder="Display name"/>

            <AccountChanged :changed="name !== classroomPinia.leaderName" :saved="response.displayName !== ''"/>
          </div>

          <div class="mb-8">
            <div class="flex flex-row text-sm text-gray-400">
              <img class="w-3.5 mr-1" src="/src/assets/img/account-icon-alert.svg" alt="alert"/>
              This name is display to your students.
            </div>
            <p v-if="error.displayName !== ''" class="px-1 text-red-800 text-sm mb-3">{{ error.displayName }}</p>
          </div>

          <!--Changing email address-->
          <p class="text-sm text-gray-400 font-semibold mb-3">Email Address</p>
          <div class="mb-3">
            <div class="flex flex-row items-center mb-1">
              <AccountInput
                  v-model="email"
                  :v$="v$.email"
                  placeholder="Email"
                  type="email"/>

              <AccountChanged :changed="email !== classroomPinia.leaderEmail" :saved="response.email !== ''"/>
            </div>
            <p v-if="error.email !== ''" class="px-1 text-red-800 text-sm mb-3">{{ error.email }}</p>
          </div>
        </div>

        <!--Password options-->
        <p class="text-sm text-gray-400 font-semibold mb-3">Password</p>
        <GenericButton
            class="flex justify-center items-center
            text-white h-11 text-sm mb-8"
            :type="'primary'"
            :callback="() => changeView('changePassword')"
        >Change Password</GenericButton>

  <!--      Todo add when we have full accounts and can check the timestamp of the password-->
  <!--      <div class="flex flex-row text-sm text-gray-400 mb-8">-->
  <!--        <img class="w-3.5 mr-1" src="/src/assets/img/account-icon-alert.svg" alt="alert"/>-->
  <!--        Password was changed x month ago.-->
  <!--      </div>-->

        <!--Marketing area-->
        <div class="mb-6">
          <p class="text-sm text-gray-400 font-semibold mb-3">News & Updates</p>

          <div class="flex flex-row items-center">
            <label class="inline-flex">
              <input class="w-4 h-4" type="checkbox" v-model="marketing"/>
              <span class="w-56 ml-4 -mt-1 text-xsm text-left text-gray-400">
                I want to receive emails about product updates, new features and offerings from LeadMe!
              </span>
            </label>

            <AccountChanged :changed="marketing !== classroomPinia.marketing" :saved="response.marketing !== ''"/>
          </div>
          <p v-if="error.marketing !== ''" class="px-1 text-red-800 text-sm mb-3">{{ error.marketing }}</p>
        </div>

        <!--Logout area-->
        <p class="text-sm text-gray-400 font-semibold mb-3">Account</p>
        <div class="w-64 h-11 mt-2.5 flex flex-row
                      items-center justify-center rounded-lg bg-gray-200 text-sm
                      font-semibold text-red-600 cursor-pointer
                      hover:bg-gray-300"
             v-on:click="logout">
          <img class="w-5 h-5 mr-3" :src="logoutIconUrl" alt="Icon"/>
          Log Out
        </div>
      </div>

      <!--Changing password page-->
      <div v-else-if="classroomPinia.accountView === 'changePassword'">
        <AccountPasswordChange @change-view="changeView" :email="classroomPinia.leaderEmail"/>
      </div>

      <!--Resetting password page-->
      <div v-else-if="classroomPinia.accountView === 'resetPassword'">
        <AccountPasswordReset @change-view="changeView" :email="classroomPinia.leaderEmail"/>
      </div>
    </Transition>

    <Transition name="fade" mode="out-in">
      <ActionBarBase v-if="changed" class="absolute flex w-full mb-10 bottom-44">
        <template v-slot:right>
          <div class="flex flex-row text-sm text-white items-center">
            <div class="mr-2">
              Some settings have been updated
            </div>

            <div class="h-9 flex items-center px-3
            rounded-3xl cursor-pointer bg-blue-400
            hover:bg-blue-300"
            v-on:click="async () => { await validateAndSubmit() }"
            >Save Settings</div>

            <div class="h-9 flex items-center px-3
            rounded-3xl cursor-pointer bg-gray-400
            hover:bg-gray-300 ml-2"
            v-on:click="rollbackChanges"
            >Cancel</div>
          </div>
        </template>
      </ActionBarBase>
    </Transition>
  </div>
</template>
