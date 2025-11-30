<template>
  <Teleport to="body">
    <transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-slate-900">Book Consultation</h2>
            <button
              class="text-slate-400 hover:text-slate-600 transition-colors"
              @click="closeModal"
              aria-label="Close modal"
            >
              <X class="w-6 h-6" />
            </button>
          </div>

          <div v-if="consultation" class="space-y-6">
            <!-- Consultation Details -->
            <div class="bg-slate-50 rounded-xl p-4">
              <h3 class="font-bold text-lg text-slate-900 mb-1">{{ consultation.title }}</h3>
              <p class="text-sm text-slate-600 mb-3">{{ consultation.description }}</p>
              <div class="flex items-center gap-4 text-sm text-slate-600">
                <span class="flex items-center gap-1">
                  <Video class="w-4 h-4" />
                  {{ consultation.durationMinutes }} minutes
                </span>
                <span class="font-bold text-slate-900">
                  {{ formatPrice(consultation.price, consultation.currency) }}
                </span>
              </div>
            </div>

            <!-- Booking Form -->
            <form v-if="!bookingSuccess" class="space-y-4" @submit.prevent="handleBooking">
              <!-- Date & Time -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Date & Time <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="bookingForm.scheduledAt"
                  type="datetime-local"
                  required
                  :min="minDateTime"
                  :class="[
                    'w-full px-4 py-2 rounded-lg border outline-none focus:ring-2',
                    isTimeSlotBooked
                      ? 'border-red-300 bg-red-50 focus:ring-red-500'
                      : 'border-slate-200 focus:ring-slate-900'
                  ]"
                />
                <div class="mt-1 space-y-1">
                  <p class="text-xs text-slate-500">Select a date and time for your consultation</p>
                  <p v-if="isTimeSlotBooked" class="text-xs text-red-600 font-medium">
                    ⚠️ This time slot is already booked. Please choose another time.
                  </p>
                  <p v-if="loadingAvailability" class="text-xs text-slate-400">
                    Loading availability...
                  </p>
                </div>
              </div>

              <!-- Timezone -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Timezone <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="bookingForm.timezone"
                  required
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
                >
                  <option value="">Select timezone...</option>
                  <option v-for="tz in commonTimezones" :key="tz.value" :value="tz.value">
                    {{ tz.label }}
                  </option>
                </select>
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  v-model="bookingForm.notes"
                  rows="4"
                  maxlength="1000"
                  placeholder="Tell the influencer about your trip plans, specific questions, or any special requirements..."
                  class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                ></textarea>
                <p class="text-xs text-slate-500 mt-1">
                  {{ bookingForm.notes?.length || 0 }}/1000 characters
                </p>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {{ error }}
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="loading || !bookingForm.scheduledAt || !bookingForm.timezone || isTimeSlotBooked"
                class="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-colors"
              >
                <span v-if="loading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <template v-else>
                  Continue to Payment →
                </template>
              </button>
            </form>

            <!-- Success State -->
            <div v-else class="text-center space-y-4">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle class="w-8 h-8 text-green-600" />
              </div>
              <h3 class="text-xl font-bold text-slate-900">Booking Request Sent!</h3>
              <p class="text-slate-600">
                Your consultation booking request has been created. Please complete the payment to confirm your booking.
              </p>
              <button
                class="w-full py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                @click="closeModal"
              >
                Close
              </button>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <p class="text-slate-600">Loading consultation details...</p>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, Video, CheckCircle } from 'lucide-vue-next'
import api from '@/services/api'
import toast from '@/utils/toast'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  consultation: {
    type: Object,
    default: null,
  },
  consultationId: {
    type: Number,
    default: null,
  },
  username: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['close', 'booking-created'])

const bookingForm = ref({
  scheduledAt: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
  notes: '',
})

const loading = ref(false)
const error = ref(null)
const bookingSuccess = ref(false)
const bookedSlots = ref([])
const loadingAvailability = ref(false)
const availabilityError = ref(null)

// Common timezones for dropdown
const commonTimezones = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
]

const minDateTime = computed(() => {
  const now = new Date()
  now.setHours(now.getHours() + 1) // At least 1 hour from now
  return now.toISOString().slice(0, 16)
})

/**
 * Check if selected time overlaps with any booked slot
 */
const isTimeSlotBooked = computed(() => {
  if (!bookingForm.value.scheduledAt || bookedSlots.value.length === 0) {
    return false
  }

  const selectedTime = new Date(bookingForm.value.scheduledAt).getTime()
  const durationMs = (props.consultation?.durationMinutes || 60) * 60 * 1000
  const selectedEnd = selectedTime + durationMs

  return bookedSlots.value.some((slot) => {
    const slotStart = new Date(slot.start).getTime()
    const slotEnd = new Date(slot.end).getTime()

    // Check for overlap: selected time overlaps if it starts before slot ends and ends after slot starts
    return selectedTime < slotEnd && selectedEnd > slotStart
  })
})

/**
 * Fetch booked time slots for the consultation
 */
const fetchAvailability = async () => {
  if (!props.consultationId) {
    return
  }

  loadingAvailability.value = true
  availabilityError.value = null

  try {
    // Calculate date range: next 90 days
    // Use UTC to avoid timezone issues - ensure start_date is today in UTC
    const now = new Date()
    const startDate = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0, 0, 0, 0
    ))
    const endDate = new Date(Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate() + 90,
      23, 59, 59, 999
    ))

    const params = {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    }

    const result = await api.getConsultationAvailability(props.consultationId, params)

    if (result.success && result.data?.bookedSlots) {
      bookedSlots.value = result.data.bookedSlots
    } else {
      bookedSlots.value = []
      availabilityError.value = result.error || 'Failed to load availability'
    }
  } catch (err) {
    console.error('[ConsultationBookingModal] Error fetching availability:', err)
    bookedSlots.value = []
    availabilityError.value = err.message || 'Failed to load availability'
  } finally {
    loadingAvailability.value = false
  }
}

const formatPrice = (price, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(price)
}

const handleBooking = async () => {
  if (!props.consultationId) {
    error.value = 'Consultation ID is missing'
    return
  }

  // Check if selected time overlaps with booked slots
  if (isTimeSlotBooked.value) {
    error.value = 'This time slot is already booked. Please select a different date and time.'
    toast.error('Time slot unavailable. Please choose another time.')
    return
  }

  loading.value = true
  error.value = null

  try {
    // Format scheduled_at to ISO 8601 format
    const scheduledAt = new Date(bookingForm.value.scheduledAt).toISOString()

    const result = await api.bookConsultation(props.consultationId, {
      scheduled_at: scheduledAt,
      timezone: bookingForm.value.timezone,
      notes: bookingForm.value.notes || null,
    })

    if (result.success) {
      bookingSuccess.value = true
      emit('booking-created', result.data.booking)
      
      // Refresh availability after successful booking
      await fetchAvailability()
      
      // Handle payment intent if present
      if (result.data.paymentIntent) {
        // TODO: Integrate Stripe payment element
        // For now, just show success message
        toast.success('Booking created! Please check your email for payment instructions.')
      } else {
        toast.success('Booking request created successfully!')
      }
    } else {
      // Handle 409 Conflict (time slot already booked)
      if (result.status === 409) {
        const errorMsg = result.error || 'Time slot already booked'
        error.value = errorMsg + '. Please select a different date and time.'
        toast.error(errorMsg)
        // Refresh availability to get latest booked slots
        await fetchAvailability()
      } else {
        error.value = result.error || 'Failed to create booking'
        toast.error(error.value)
      }
    }
  } catch (err) {
    error.value = err.message || 'An error occurred while creating the booking'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  emit('close')
  // Reset form after animation
  setTimeout(() => {
    bookingForm.value = {
      scheduledAt: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York',
      notes: '',
    }
    error.value = null
    bookingSuccess.value = false
    loading.value = false
  }, 300)
}

// Watch for modal open/close
watch(() => props.isOpen, async (isOpen) => {
  if (isOpen) {
    // Reset form when modal opens
    bookingForm.value.scheduledAt = ''
    bookingForm.value.notes = ''
    error.value = null
    bookingSuccess.value = false
    bookedSlots.value = []
    availabilityError.value = null
    
    // Fetch availability when modal opens
    if (props.consultationId) {
      await fetchAvailability()
    }
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

