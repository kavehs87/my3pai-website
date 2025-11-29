<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
    <div class="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
      <!-- Progress Header -->
      <div class="bg-slate-900 p-6 text-white">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold">New Trip</h2>
          <button @click="$router.push('/travel-collaboration')" class="text-slate-400 text-sm hover:text-white">Cancel</button>
        </div>
        <div class="flex justify-between relative">
          <div class="absolute top-1/2 left-0 w-full h-0.5 bg-slate-700 -z-0"></div>
          <div 
            v-for="step in steps" 
            :key="step.id" 
            class="relative z-10 flex flex-col items-center gap-2"
          >
            <div :class="[
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
              currentStep === step.id 
                ? 'bg-primary-500 text-white scale-110 ring-4 ring-primary-500/20' 
                : step.id < currentStep 
                  ? 'bg-green-500 text-white' 
                  : 'bg-slate-700 text-slate-400'
            ]">
              <CheckCircle v-if="step.id < currentStep" class="w-5 h-5" />
              <span v-else>{{ step.id }}</span>
            </div>
            <span :class="['text-xs', currentStep === step.id ? 'text-white' : 'text-slate-500']">{{ step.title }}</span>
          </div>
        </div>
      </div>

      <!-- Content Body -->
      <div class="p-8 min-h-[300px] flex flex-col">
        
        <div v-if="currentStep === 1" class="animate-in fade-in slide-in-from-right-4">
          <h3 class="text-2xl font-bold text-slate-900 mb-2">Where are you going?</h3>
          <p class="text-slate-500 mb-6">Search for a city or airport.</p>
          
          <div class="space-y-4">
            <input 
              type="text" 
              placeholder="e.g. Kyoto, Japan" 
              class="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-lg"
              autofocus
              v-model="formData.city"
            />
            <div class="flex gap-2 flex-wrap">
              <span 
                v-for="city in quickCities" 
                :key="city"
                @click="formData.city = city"
                class="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 cursor-pointer hover:bg-slate-200"
              >
                {{ city }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 2" class="animate-in fade-in slide-in-from-right-4">
          <h3 class="text-2xl font-bold text-slate-900 mb-2">When is the trip?</h3>
          <p class="text-slate-500 mb-6">Dates help us show you who's around.</p>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-bold text-slate-500 uppercase">Start</label>
                <input 
                  type="date" 
                  class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1"
                  v-model="formData.startDate"
                />
              </div>
              <div>
                <label class="text-xs font-bold text-slate-500 uppercase">End</label>
                <input 
                  type="date" 
                  class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl mt-1"
                  v-model="formData.endDate"
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="currentStep === 3" class="animate-in fade-in slide-in-from-right-4">
          <h3 class="text-2xl font-bold text-slate-900 mb-2">What's your goal?</h3>
          <p class="text-slate-500 mb-6">We'll customize your feed based on this.</p>
          
          <div class="grid grid-cols-1 gap-3">
            <label 
              v-for="intent in intents" 
              :key="intent"
              class="flex items-center p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <input 
                type="checkbox" 
                :value="intent"
                v-model="formData.intents"
                class="w-5 h-5 text-primary-600 rounded focus:ring-primary-500" 
              />
              <span class="ml-3 font-medium text-slate-700">{{ intent }}</span>
            </label>
          </div>
        </div>

        <div class="mt-auto pt-8 flex justify-end">
          <button 
            @click="handleNext"
            class="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            {{ currentStep === 3 ? 'Create Trip' : 'Continue' }} <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronRight, Calendar, MapPin, Target, CheckCircle } from 'lucide-vue-next'

const steps = [
  { id: 1, title: 'Where', icon: MapPin },
  { id: 2, title: 'When', icon: Calendar },
  { id: 3, title: 'Why', icon: Target },
]

export default {
  name: 'CreateTrip',
  components: {
    ChevronRight,
    Calendar,
    MapPin,
    Target,
    CheckCircle
  },
  setup() {
    const router = useRouter()
    const currentStep = ref(1)
    const formData = ref({
      city: '',
      startDate: '',
      endDate: '',
      intents: []
    })

    const quickCities = ['Paris', 'London', 'New York']
    const intents = ['Social & Fun', 'Content Creation', 'Professional Networking', 'Remote Work']

    const handleNext = () => {
      if (currentStep.value < 3) {
        currentStep.value++
      } else {
        router.push('/travel-collaboration')
      }
    }

    return {
      currentStep,
      formData,
      steps,
      quickCities,
      intents,
      handleNext
    }
  }
}
</script>

