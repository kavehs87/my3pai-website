<template>
  <div v-if="isBooked" class="min-h-screen pt-36 pb-12 flex flex-col items-center justify-center container mx-auto px-4">
    <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
      <Check class="w-10 h-10" />
    </div>
    <h2 class="text-3xl font-bold text-primary mb-2">Booking Confirmed!</h2>
    <p class="text-text-muted text-center max-w-md mb-8">
      You're all set for your 1:1 consultation. A calendar invitation has been sent to your email.
    </p>
    <button @click="$emit('back')" class="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
      Return to Profile
    </button>
  </div>

  <div
    v-else
    class="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-surface"
    :style="{ paddingTop: '5rem', paddingBottom: '3rem' }"
  >
    <button
      @click="$emit('back')"
      class="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
    >
      <ArrowLeft class="w-5 h-5" /> Back to Profile
    </button>

    <div class="grid lg:grid-cols-12 gap-12">
      <!-- Left Column: Calendar -->
      <div class="lg:col-span-7">
        <h1 class="text-3xl md:text-4xl font-bold text-primary mb-4">Book a 1:1 Session</h1>
        <p class="text-text-muted text-lg mb-8">
          Get personalized travel advice, itinerary reviews, or content creation coaching. Select a date to see available times.
        </p>

        <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-primary/5 border border-slate-100">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-primary flex items-center gap-2">
              <CalendarIcon class="w-5 h-5 text-secondary" />
              {{ currentMonthYear }}
            </h3>
            <div class="flex gap-4 text-xs font-medium">
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-emerald-100 rounded-full"></div> Available
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-orange-100 rounded-full"></div> Limited
              </div>
              <div class="flex items-center gap-1">
                <div class="w-3 h-3 bg-slate-100 rounded-full"></div> Full
              </div>
            </div>
          </div>

          <!-- Day Headers -->
          <div class="grid grid-cols-7 gap-3 mb-2 text-center text-xs font-semibold text-text-light uppercase tracking-wider">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">
              {{ day }}
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-3">
            <button
              v-for="(day, i) in calendarDays"
              :key="i"
              :disabled="day.status === 'full'"
              @click="selectedDate = day"
              :class="[
                'aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative',
                getCellColor(day.status, selectedDate?.date === day.date)
              ]"
            >
              <span class="text-lg font-bold">{{ i + 1 }}</span>
              <span v-if="day.status !== 'full'" class="text-[10px] font-medium opacity-80">
                {{ day.slotsAvailable }} slots
              </span>
              <div v-if="day.status === 'full'" class="absolute inset-0 flex items-center justify-center">
                <div class="w-full h-px bg-slate-300 rotate-45"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Time & Form -->
      <div class="lg:col-span-5">
        <div
          :class="[
            'bg-white rounded-3xl p-6 md:p-8 shadow-lg border border-slate-100 h-full transition-all duration-300',
            !selectedDate ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'
          ]"
        >
          <div v-if="!selectedDate" class="h-full flex flex-col items-center justify-center text-center text-text-light p-8">
            <Clock class="w-12 h-12 mb-4 opacity-20" />
            <p>Select a date from the calendar to view available time slots.</p>
          </div>

          <div v-else class="animate-in fade-in slide-in-from-right-4 duration-300">
            <h3 class="text-xl font-bold text-primary mb-2">
              {{ formatSelectedDate(selectedDate.date) }}
            </h3>
            <div class="flex items-center gap-1 mb-6">
              <span class="text-text-muted text-sm">30 Minute Session • </span>
              <PriceDisplay :amount="consultationPrice" class="text-text-muted text-sm" />
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-primary mb-3">Available Times</label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="slot in timeSlots"
                    :key="slot.id"
                    :disabled="!slot.available"
                    @click="selectedTime = slot.time"
                    :class="[
                      'py-2 px-4 rounded-lg text-sm font-medium border transition-all',
                      !slot.available
                        ? 'bg-slate-50 text-slate-300 border-slate-100 decoration-slate-300 line-through'
                        : selectedTime === slot.time
                          ? 'bg-secondary text-white border-secondary shadow-md'
                          : 'bg-white text-primary border-slate-200 hover:border-secondary hover:text-secondary'
                    ]"
                  >
                    {{ slot.time }}
                  </button>
                </div>
              </div>

              <form v-if="selectedTime" @submit.prevent="handleBook" class="space-y-4 pt-6 border-t border-slate-100">
                <div>
                  <label class="block text-sm font-medium text-primary mb-1">Your Name</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    required
                    class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-primary mb-1">Email Address</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    required
                    class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-primary mb-1">Topic (Optional)</label>
                  <textarea
                    v-model="formData.topic"
                    class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 h-24 resize-none"
                    placeholder="What would you like to discuss?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting ? 'Booking...' : 'Confirm Booking' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { ArrowLeft, CalendarIcon, Clock, Check } from 'lucide-vue-next'
import PriceDisplay from '../components/PriceDisplay.vue'
import { useConsultation } from '@/shared/influencer/composables/useConsultation'
import api from '@/services/api'

const emit = defineEmits(['back', 'book'])

const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value)

const { consultation, fetchConsultation } = useConsultation()

const selectedDate = ref(null)
const selectedTime = ref(null)
const isBooked = ref(false)
const isSubmitting = ref(false)

const formData = ref({
  name: '',
  email: '',
  topic: '',
})

// Generate calendar days for current month
const today = new Date()
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

const calendarDays = computed(() => {
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0]
    
    // Deterministic "random" logic for mock data
    const seed = (day * 7) % 10
    let status = 'available'
    let slotsAvailable = 5

    if (seed < 3) {
      status = 'full'
      slotsAvailable = 0
    } else if (seed < 6) {
      status = 'limited'
      slotsAvailable = 1 + (day % 2) // 1 or 2 slots
    }

    return { date, slotsAvailable, status }
  })
})

const currentMonthYear = computed(() => {
  return today.toLocaleString('default', { month: 'long', year: 'numeric' })
})

const timeSlots = ref([
  { id: 't1', time: '09:00 AM', available: true },
  { id: 't2', time: '10:00 AM', available: true },
  { id: 't3', time: '11:00 AM', available: false }, // Booked
  { id: 't4', time: '01:00 PM', available: true },
  { id: 't5', time: '02:00 PM', available: true },
  { id: 't6', time: '03:00 PM', available: false }, // Booked
  { id: 't7', time: '04:00 PM', available: true },
])

const consultationPrice = computed(() => {
  return consultation.value?.price || 150
})

const getCellColor = (status, isSelected) => {
  if (isSelected) return 'bg-primary text-white ring-2 ring-primary ring-offset-2'
  if (status === 'full') return 'bg-slate-100 text-slate-400 cursor-not-allowed'
  if (status === 'limited') return 'bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer'
  return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
}

const formatSelectedDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })
}

const handleBook = async () => {
  if (!selectedDate.value || !selectedTime.value) return

  isSubmitting.value = true

  try {
    // TODO: Call actual booking API when available
    // For now, simulate booking
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // In real implementation:
    // const result = await api.createConsultationBooking({
    //   date: selectedDate.value.date,
    //   time: selectedTime.value,
    //   name: formData.value.name,
    //   email: formData.value.email,
    //   topic: formData.value.topic,
    // })

    isBooked.value = true
    emit('book')
  } catch (error) {
    console.error('Booking error:', error)
    // Show error toast
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  if (currentUsername.value) {
    await fetchConsultation(currentUsername.value)
  }
})
</script>

