<script setup lang="ts">
import { ref } from "vue";
import { useStorage } from "@/hooks/useStorage";
import { VOnboardingWrapper, VOnboardingStep, useVOnboarding } from 'v-onboarding';
import onboardingGetStarted from '/src/assets/img/onboarding/get_started.svg'
import onboardingShareCode from '/src/assets/img/onboarding/share_code.png'
import onboardingDeliverContent from '/src/assets/img/onboarding/deliver_content.png'
import onboardingOnTask from '/src/assets/img/onboarding/keep_on_task.png'

const steps = ref([
  {
    attachTo: {
      element: '#generate_class',
    },
    content: {
      title: 'Get started',
      description: 'Generate a class code to begin your session!',
      image: onboardingGetStarted
    },
    options: {
      popper: {
        placement: 'right-start'
      },
      overlay: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5
        },
        borderRadius: {
          leftTop: 10,
          rightTop: 10,
          rightBottom: 10,
          leftBottom: 10
        }
      }
    }
  },
  {
    attachTo: {
      element: '#generate_class'
    },
    content: {
      title: 'Share code',
      description: 'Instruct your class to punch in the code on their device',
      image: onboardingShareCode
    },
    options: {
      popper: {
        placement: 'left-start'
      },
      overlay: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5
        },
        borderRadius: {
          leftTop: 10,
          rightTop: 10,
          rightBottom: 10,
          leftBottom: 10
        }
      }
    }
  },
  {
    attachTo: {
      element: '#share_button'
    },
    content: {
      title: 'Deliver content instantly',
      description: 'Share website content directly to your student\'s browser',
      image: onboardingDeliverContent
    },
    options: {
      popper: {
        placement: 'bottom-start'
      },
      overlay: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5
        },
        borderRadius: {
          leftTop: 10,
          rightTop: 10,
          rightBottom: 10,
          leftBottom: 10
        }
      }
    }
  },
  {
    attachTo: {
      element: '#student_placeholder'
    },
    content: {
      title: 'Keep your students on task',
      description: 'Easily identify students who are off task, and bring them back',
      image: onboardingOnTask
    },
    options: {
      popper: {
        placement: 'bottom-start'
      },
      overlay: {
        padding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5
        },
        borderRadius: {
          leftTop: 10,
          rightTop: 10,
          rightBottom: 10,
          leftBottom: 10
        }
      }
    }
  }
]);

const wrapper = ref(null)
const { start, goToStep, finish } = useVOnboarding(wrapper);

const { setLocalStorage } = useStorage();

async function closeOnboarding() {
  await setLocalStorage("onboarding_completed", true);
  finish();
}

defineExpose({
  start,
});
</script>

<template>
  <VOnboardingWrapper ref="wrapper" :steps="steps" class="z-30">
    <template #default="{ previous, next, step, isFirst, isLast, index }">
      <VOnboardingStep>
        <div class="bg-white shadow sm:rounded-lg m-2 h-96 w-onboarding-width">
          <div class="flex flex-col justify-between h-full">
            <div class="flex justify-end px-6 pt-6">
              <button @click="closeOnboarding">
                <img src="/src/assets/img/onboarding/close.svg" alt="close"/>
              </button>
            </div>

            <div class="px-6 py-6">
              <div v-if="step.content" class="flex flex-row items-center">
                <div class="pr-16" style="width: 55%">
                  <h3 v-if="step.content.title" class="text-2xl font-medium leading-8">{{ step.content.title }}</h3>
                  <div v-if="step.content.description" class="mt-2 text-lg font-normal">
                    <p>{{ step.content.description }}</p>
                  </div>
                </div>
                <img :src="step.content.image" class="h-fit" style="width: 45%" alt="image step"/>
              </div>
            </div>

            <div>
              <div class="border-t-gray-200 border-t-2 px-6 py-6 flex flex-row justify-between items-center">
                <div class="flex flex-row align-middle h-full">
                  <button
                      @click="() => {goToStep(indexCounter)}"
                      v-for="(stepCounter, indexCounter) in steps"
                      :key="indexCounter"
                      class="h-2.5 w-2.5 rounded-2xl first:ml-0 ml-2"
                      :class="index === indexCounter ? 'bg-blue-500' : 'bg-gray-300'"/>
                </div>
                <div>
                  <button v-if="!isLast" @click="closeOnboarding" class="text-md text-lg">Skip</button>
                  <button v-if="!isFirst" @click="previous" class="text-blue-500 font-semibold text-lg ml-4">Previous</button>
                  <button v-if="!isLast" @click="next" class="text-blue-500 font-semibold text-lg ml-4">Next</button>
                  <button v-else @click="closeOnboarding" class="text-blue-500 text-lg ml-4">Finish</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VOnboardingStep>
    </template>
  </VOnboardingWrapper>
</template>

<style>
[data-v-onboarding-wrapper] [data-popper-arrow]::before {
  content: '';
  background: white;
  top: 0;
  left: 0;
  transition: transform 0.2s ease-out,visibility 0.2s ease-out;
  visibility: visible;
  transform: translateX(0px) rotate(45deg);
  transform-origin: center;
  width: 10px;
  height: 10px;
  position: absolute;
  z-index: -1;
}

[data-v-onboarding-wrapper] [data-popper-placement^='top'] > [data-popper-arrow] {
  bottom: 5px;
}

[data-v-onboarding-wrapper] [data-popper-placement^='right'] > [data-popper-arrow] {
  left: 4px;
}

[data-v-onboarding-wrapper] [data-popper-placement^='bottom'] > [data-popper-arrow] {
  top: 4px;
}

[data-v-onboarding-wrapper] [data-popper-placement^='left'] > [data-popper-arrow] {
  right: 13px;
}
</style>