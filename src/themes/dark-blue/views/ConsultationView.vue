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

          <!-- Loading State -->
          <div v-if="loadingCalendar" class="text-center py-12 text-text-muted">
            <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading calendar...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="calendarError" class="text-center py-12 text-text-muted">
            <p class="text-red-600">{{ calendarError }}</p>
          </div>

          <!-- Calendar Grid -->
          <div v-else class="grid grid-cols-7 gap-3">
            <button
              v-for="(day, i) in calendarDays"
              :key="i"
              :disabled="day.status === 'full' || day.status === 'unavailable'"
              @click="handleDateSelect(day)"
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
                  <span class="text-text-muted text-sm">{{ consultationDuration }} • </span>
                  <PriceDisplay :amount="consultationPrice" class="text-text-muted text-sm" />
                </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-primary mb-3">Available Times</label>
                
                <!-- Loading Time Slots -->
                <div v-if="loadingTimeSlots" class="text-center py-8 text-text-muted">
                  <div class="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                  <p class="text-sm">Loading time slots...</p>
                </div>

                <!-- Error Loading Time Slots -->
                <div v-else-if="timeSlotsError" class="text-center py-8 text-text-muted">
                  <p class="text-sm text-red-600">{{ timeSlotsError }}</p>
                </div>

                <!-- Time Slots Grid -->
                <div v-else-if="timeSlots.length > 0" class="grid grid-cols-2 gap-3">
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
                <div v-else class="text-center py-8 text-text-muted">
                  <p class="text-sm">No time slots available for this date.</p>
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
import { ref, computed, onMounted, watch, inject } from 'vue'
import { ArrowLeft, CalendarIcon, Clock, Check } from 'lucide-vue-next'
import PriceDisplay from '../components/PriceDisplay.vue'
import { useConsultation } from '@/shared/influencer/composables/useConsultation'
import api from '@/services/api'
import { convertTime, formatTime12Hour, isTimeSlotPast, convertDateTimeToUTC } from '@/utils/timezone'

const emit = defineEmits(['back', 'book'])

const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value)

const { consultation, fetchConsultation } = useConsultation()

const selectedDate = ref(null)
const selectedTime = ref(null)
const isBooked = ref(false)
const isSubmitting = ref(false)
const loadingCalendar = ref(false)
const loadingTimeSlots = ref(false)
const calendarError = ref(null)
const timeSlotsError = ref(null)

// Timezone handling - all conversions done on UI side
const influencerTimezone = ref(null) // Will be set from API response
const customerTimezone = computed(() => Intl.DateTimeFormat().resolvedOptions().timeZone) // Browser timezone

const formData = ref({
  name: '',
  email: '',
  topic: '',
})

// Calendar data from API
const calendarData = ref(null)
const today = new Date()
const currentMonth = ref(today.getMonth() + 1)
const currentYear = ref(today.getFullYear())

// Generate calendar days from API data
const calendarDays = computed(() => {
  if (!calendarData.value?.days) {
    // Fallback: generate empty calendar structure
    const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to compare dates only
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const date = formatDateLocal(currentYear.value, currentMonth.value - 1, day)
      
      // Check if date is in the past
      const dateObj = new Date(currentYear.value, currentMonth.value - 1, day)
      dateObj.setHours(0, 0, 0, 0)
      const isPast = dateObj < today
      
      return { date, slotsAvailable: 0, status: isPast ? 'unavailable' : 'unavailable' }
    })
  }

  // Map API data to calendar days
  const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const apiDaysMap = new Map(calendarData.value.days.map(d => [d.date, d]))

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = formatDateLocal(currentYear.value, currentMonth.value - 1, day)
    
    // Check if date is in the past
    const dateObj = new Date(currentYear.value, currentMonth.value - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to compare dates only
    dateObj.setHours(0, 0, 0, 0)
    const isPast = dateObj < today
    
    const apiDay = apiDaysMap.get(date)

    if (apiDay) {
      return {
        date: apiDay.date,
        slotsAvailable: apiDay.slotsAvailable || 0,
        status: isPast ? 'unavailable' : (apiDay.status || 'unavailable'),
      }
    }

    // Day not in API response (likely outside working hours or past)
    return {
      date,
      slotsAvailable: 0,
      status: isPast ? 'unavailable' : 'unavailable',
    }
  })
})

const currentMonthYear = computed(() => {
  return new Date(currentYear.value, currentMonth.value - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
})

// Time slots from API
const timeSlots = ref([])

const consultationPrice = computed(() => {
  return consultation.value?.price || 150
})

const consultationDuration = computed(() => {
  const minutes = consultation.value?.durationMinutes || 30
  if (minutes === 60) {
    return '1 Hour Session'
  } else if (minutes === 90) {
    return '1.5 Hour Session'
  } else if (minutes === 120) {
    return '2 Hour Session'
  } else {
    return `${minutes} Minute Session`
  }
})

const getCellColor = (status, isSelected) => {
  if (isSelected) return 'bg-primary text-white ring-2 ring-primary ring-offset-2'
  if (status === 'full' || status === 'unavailable') return 'bg-slate-100 text-slate-400 cursor-not-allowed'
  if (status === 'limited') return 'bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer'
  return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
}

// Helper function to format date in local timezone (YYYY-MM-DD)
const formatDateLocal = (year, month, day) => {
  const date = new Date(year, month, day)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatSelectedDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00') // Parse as local date
  return date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })
}

// Fetch calendar availability
const fetchCalendarAvailability = async () => {
  if (!currentUsername.value || !consultation.value?.id) return

  loadingCalendar.value = true
  calendarError.value = null

  try {
    // No timezone parameter - backend returns data in influencer's timezone
    const result = await api.getConsultationCalendarAvailability(currentUsername.value, {
      month: `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`,
    })

    if (result.success) {
      // Handle both response structures: result.data.data or result.data
      const data = result.data?.data || result.data
      calendarData.value = data
      
      // Get influencer's timezone from response
      if (data?.timezone) {
        influencerTimezone.value = data.timezone
      }
    } else {
      calendarError.value = result.error || 'Failed to load calendar availability'
    }
  } catch (error) {
    console.error('Error fetching calendar availability:', error)
    calendarError.value = error.message || 'An unexpected error occurred'
  } finally {
    loadingCalendar.value = false
  }
}

// Fetch time slots for selected date
const fetchTimeSlots = async (date) => {
  if (!currentUsername.value || !date) return

  loadingTimeSlots.value = true
  timeSlotsError.value = null
  timeSlots.value = []

  try {
    // No timezone parameter - backend returns data in influencer's timezone
    const result = await api.getConsultationTimeSlots(currentUsername.value, {
      date,
    })

    if (result.success) {
      // Handle both response structures: result.data.data or result.data
      const data = result.data?.data || result.data
      
      // Get influencer's timezone from response if not already set
      if (data?.timezone && !influencerTimezone.value) {
        influencerTimezone.value = data.timezone
      }
      
      if (data?.timeSlots && influencerTimezone.value) {
        // Backend returns times in influencer's timezone
        // Convert to customer's timezone for display and filter past slots
        const isToday = isDateToday(date)
        
        timeSlots.value = data.timeSlots
          .map((slot, index) => {
            const slotTimeInInfluencerTZ = slot.time || ''
            
            // Convert time from influencer's timezone to customer's timezone for display
            const slotTimeInCustomerTZ = convertTime(
              slotTimeInInfluencerTZ,
              date,
              influencerTimezone.value,
              customerTimezone.value
            )
            
            // Check if slot is in the past (in influencer's timezone)
            let isAvailable = slot.available !== false
            if (isToday && isAvailable && slotTimeInInfluencerTZ) {
              isAvailable = !isTimeSlotPast(slotTimeInInfluencerTZ, date, influencerTimezone.value)
            }
            
            return {
              id: slotTimeInInfluencerTZ || `slot-${index}`,
              time: formatTime12Hour(slotTimeInCustomerTZ), // Display in customer's timezone
              available: isAvailable,
              rawTime: slotTimeInInfluencerTZ, // Keep raw time in influencer's timezone for booking
              rawTimeInCustomerTZ: slotTimeInCustomerTZ, // Also keep converted time
            }
          })
          .filter(slot => {
            // Filter out past unavailable slots for today
            if (isToday) {
              return slot.available
            }
            return true
          })
      } else if (data?.timeSlots && !influencerTimezone.value) {
        // Fallback: use times as-is if timezone not available
        timeSlots.value = data.timeSlots.map((slot, index) => ({
          id: slot.time || `slot-${index}`,
          time: slot.formatted || slot.time || '',
          available: slot.available !== false,
          rawTime: slot.time,
        }))
      } else {
        timeSlotsError.value = 'No time slots available'
      }
    } else {
      timeSlotsError.value = result.error || 'Failed to load time slots'
    }
  } catch (error) {
    console.error('Error fetching time slots:', error)
    timeSlotsError.value = error.message || 'An unexpected error occurred'
  } finally {
    loadingTimeSlots.value = false
  }
}

// Helper: Check if date is today
const isDateToday = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date.getTime() === today.getTime()
}

// Watch for date selection
const handleDateSelect = (day) => {
  if (day.status === 'full' || day.status === 'unavailable') return

  selectedDate.value = day
  selectedTime.value = null // Reset time selection

  // Fetch time slots for selected date
  if (day.date) {
    fetchTimeSlots(day.date)
  }
}

const handleBook = async () => {
  if (!selectedDate.value || !selectedTime.value || !consultation.value?.id || !influencerTimezone.value) return

  isSubmitting.value = true

  try {
    // Find the selected time slot - selectedTime is the displayed time in customer's timezone
    const selectedSlot = timeSlots.value.find((s) => s.time === selectedTime.value)
    if (!selectedSlot) {
      throw new Error('Selected time slot not found')
    }

    // Get the time in customer's timezone (what they selected)
    // rawTimeInCustomerTZ is already in 24-hour format (HH:MM)
    const customerTime24 = selectedSlot.rawTimeInCustomerTZ
    
    if (!customerTime24) {
      throw new Error('Time slot time not found')
    }

    // Convert from customer's timezone to UTC for booking
    const scheduledAtUTC = convertDateTimeToUTC(
      selectedDate.value.date,
      customerTime24, // Already in HH:MM format
      customerTimezone.value
    )

    if (!scheduledAtUTC) {
      throw new Error('Failed to convert booking time to UTC')
    }

    const result = await api.bookConsultation(consultation.value.id, {
      scheduled_at: scheduledAtUTC,
      notes: formData.value.topic || null,
    })

    if (result.success) {
      isBooked.value = true
      emit('book')
      // Refresh calendar to update availability
      await fetchCalendarAvailability()
    } else {
      throw new Error(result.error || 'Failed to book consultation')
    }
  } catch (error) {
    console.error('Booking error:', error)
    // TODO: Show error toast
    alert(error.message || 'Failed to book consultation. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Watch for consultation to load, then fetch calendar
watch(
  () => consultation.value,
  (consultation) => {
    // Get influencer's timezone from consultation response
    if (consultation?.timezone && !influencerTimezone.value) {
      influencerTimezone.value = consultation.timezone
    }
    
    // Fetch calendar once we have consultation ID
    if (consultation?.id && currentUsername.value) {
      fetchCalendarAvailability()
    }
  },
  { immediate: true, deep: true }
)

onMounted(async () => {
  if (currentUsername.value) {
    // No timezone parameter - backend returns data in influencer's timezone
    await fetchConsultation(currentUsername.value)
  }
})
</script>

