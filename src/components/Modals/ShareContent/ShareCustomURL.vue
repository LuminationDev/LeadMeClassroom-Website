<script setup lang="ts">
import { ref, nextTick } from "vue";
import { helpers, required } from "@vuelidate/validators";
import useVuelidate from "@vuelidate/core";
import devicesIconUrl from '/src/assets/img/share-content-devices.svg';
import fadedLinkIconUrl from '/src/assets/img/share-content-link-faded.svg';
import activeLinkIconUrl from '/src/assets/img/share-content-link-active.svg';
import solidLinkIconUrl from '/src/assets/img/share-content-link-solid.svg';
import selectIconUrl from '/src/assets/img/selection-icon-individual.svg';
import allIconUrl from '/src/assets/img/selection-icon-all.svg';

const websiteLink = ref("");
const inputFocus = ref(false);
const urlInput = ref<HTMLInputElement | null>(null)

const rules = {
  websiteLink: {
    required: helpers.withMessage("Website link is required", required)
  }
}

const v$ = useVuelidate(rules, { websiteLink });

async function validate(): Promise<boolean> {
  return await v$.value.$validate();
}

const showURLInput = () => {
  inputFocus.value = true
  nextTick(() => {
    urlInput.value!.focus();
  });
}

const selectIndividuals = () => {
  console.log("Do something");
}

const selectAll = () => {
  console.log("Do something else");
}
</script>

<template>
  <!--URL 'button' that switches to the input-->
  <div v-if="!inputFocus && websiteLink.length === 0" class="flex justify-between items-center
              text-gray-400 text-lg
              bg-white rounded-2xl p-1 h-16 cursor-pointer"
       v-on:click="showURLInput">

    <!--Placeholder to keep the url text centered-->
    <div class="w-5 h-5 ml-5"></div>

    <div class="flex justify-center items-center">
      <img class="w-5 h-5 mr-3" :src="fadedLinkIconUrl" alt="Icon"/>
      Share a Custom URL
    </div>

    <img class="w-5 h-5 mr-5" :src="devicesIconUrl" alt="Icon"/>
  </div>

  <!--URL input area with selection buttons-->
  <div v-else class="flex justify-between items-center
       text-lg bg-white rounded-2xl p-1 h-16">

    <img class="w-5 h-5 ml-8" :src="inputFocus ? activeLinkIconUrl : solidLinkIconUrl" alt="Icon"/>

    <input
        ref="urlInput"
        class="h-11 ml-2 mr-6 flex-grow border-0 outline-0 bg-white text-base text-black rounded-lg"
        type="text"
        placeholder="Paste a URL..."
        v-model="v$.websiteLink.$model"
        @focusin="inputFocus = true"
        @focusout="inputFocus = false"
    />

    <div class="flex flex-row mr-8">
      <div :class="{
        'h-9 flex items-center pl-3 pr-4 rounded-3xl text-base text-white': true,
        'cursor-pointer bg-blue-400 hover:bg-blue-300': websiteLink.length > 0,
        'bg-blue-200': websiteLink.length === 0 }"
         v-on:click="selectIndividuals"
      >
        <img class="w-5 h-5 mr-2" :src="selectIconUrl" alt="Icon"/>
        Select
      </div>

      <div :class="{
        'h-9 flex items-center ml-2 pl-3 pr-4 rounded-3xl text-base text-white': true,
        'cursor-pointer bg-blue-400 hover:bg-blue-300': websiteLink.length > 0,
        'bg-blue-200': websiteLink.length === 0 }"
         v-on:click="selectAll"
      >
        <img class="w-5 h-5 mr-2" :src="allIconUrl" alt="Icon"/>
        All
      </div>
    </div>
  </div>
</template>
