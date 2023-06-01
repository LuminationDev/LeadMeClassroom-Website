<script setup lang="ts">
import { usePopupStore } from "../../../stores/popupStore";
import GenericButton from "../../Buttons/GenericButton.vue";
import { onMounted, ref} from "vue";
const popupPinia = usePopupStore();

async function submit() {
  await popupPinia.resendVerificationEmail()
}

const emit = defineEmits<{
  (e: 'changeView', newView: string): void
}>()

const email = ref("");

</script>

<template>
  <form @submit.prevent class="mt-6 pb-5">
    <div class="mb-10">
      Your email has not been verified. Please verify it to continue.
    </div>

    <!--Display a spinner while waiting for a response-->
    <GenericButton class="mb-6" :type="'secondary'" :callback="submit">Resend Email</GenericButton>
  </form>
</template>
