<template>
  <!-- Success State -->
  <div v-if="isBooked" class="min-h-screen pt-36 pb-12 flex flex-col items-center justify-center px-4">
    <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
      <Check class="w-10 h-10" />
    </div>
    <h2 class="text-3xl font-bold text-slate-900 mb-2">Booking & Payment Confirmed!</h2>
    <p class="text-slate-500 text-center max-w-md mb-4">
      You're all set for your 1:1 consultation. A calendar invitation has been sent to your email.
    </p>
    <div v-if="orderNumber" class="text-center mb-6">
      <p class="text-sm text-slate-500 mb-2">Order Number:</p>
      <p class="text-lg font-bold text-slate-900">{{ orderNumber }}</p>
    </div>
    <div class="flex flex-col sm:flex-row gap-4">
      <button 
        v-if="orderId" 
        @click="viewOrder" 
        class="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
      >
        View Order Details
      </button>
      <button 
        @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })" 
        class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
      >
        Return to Profile
      </button>
    </div>
  </div>

  <!-- Main Booking View -->
  <div
    v-else
    class="pt-24 pb-12 px-4 lg:px-12 xl:px-16 2xl:px-24 max-w-7xl mx-auto"
  >
    <button
      @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
      class="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
    >
      <ChevronLeft class="w-4 h-4" /> Back to Home
    </button>

    <div class="flex items-center gap-4 mb-8">
      <div class="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
        <Calendar class="w-8 h-8" />
      </div>
      <div>
        <h1 class="text-3xl font-bold text-slate-900">Book a Consultation</h1>
        <p class="text-slate-500">Plan your perfect trip with 1-on-1 expert advice.</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Left Column: Calendar -->
      <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <button
                @click="goToPreviousMonth"
                class="p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900"
                :disabled="loadingCalendar"
                aria-label="Previous month"
              >
                <ChevronLeft class="w-5 h-5" />
              </button>
              <h3 class="text-xl font-bold text-slate-900 flex items-center gap-2 min-w-[200px] justify-center">
                <Calendar class="w-5 h-5 text-indigo-600" />
                {{ currentMonthYear }}
              </h3>
              <button
                @click="goToNextMonth"
                class="p-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-900"
                :disabled="loadingCalendar"
                aria-label="Next month"
              >
                <ChevronRight class="w-5 h-5" />
              </button>
            </div>
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
        </div>

        <!-- Timezone Notice -->
        <div v-if="influencerTimezone" class="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
          <Info class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p class="text-xs text-blue-800">
            <span class="font-medium">Time zone:</span>
            All times are displayed in {{ formattedInfluencerTimezone }}. Times will be automatically converted to your local time zone.
          </p>
        </div>

        <!-- Day Headers -->
        <div class="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <div v-for="day in ['S','M','T','W','T','F','S']" :key="day">
            {{ day }}
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loadingCalendar" class="text-center py-12 text-slate-500">
          <div class="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading calendar...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="calendarError" class="text-center py-12 text-slate-500">
          <p class="text-red-600">{{ calendarError }}</p>
        </div>

        <!-- Calendar Grid -->
        <div v-else class="grid grid-cols-7 gap-2">
          <!-- Empty cells for days before month starts -->
          <div
            v-for="emptyDay in emptyDaysAtStart"
            :key="`empty-${emptyDay}`"
            class="aspect-square"
          ></div>
          
          <!-- Actual calendar days -->
          <button
            v-for="(day, i) in calendarDays"
            :key="day.date || i"
            :disabled="day.status === 'full' || day.status === 'unavailable'"
            @click="handleDateSelect(day)"
            :class="[
              'aspect-square rounded-xl flex flex-col items-center justify-center transition-all relative',
              getCellColor(day.status, selectedDate?.date === day.date)
            ]"
          >
            <span class="text-lg font-bold">{{ new Date(day.date).getDate() }}</span>
            <span v-if="day.status !== 'full'" class="text-[10px] font-medium opacity-80">
              {{ day.slotsAvailable }} slots
            </span>
            <div v-if="day.status === 'full'" class="absolute inset-0 flex items-center justify-center">
              <div class="w-full h-px bg-slate-300 rotate-45"></div>
            </div>
          </button>
        </div>
      </div>

      <!-- Right Column: Time & Form -->
      <div class="flex flex-col gap-6">
        <div
          :class="[
            'bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all duration-300',
            !selectedDate ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'
          ]"
        >
          <div v-if="!selectedDate" class="h-full flex flex-col items-center justify-center text-center text-slate-400 p-8">
            <Calendar class="w-12 h-12 mb-4 opacity-20" />
            <p>Select a date from the calendar to view availability.</p>
          </div>

          <div v-else class="animate-fade-in">
            <h3 class="text-xl font-bold text-slate-900 mb-2">
              {{ formatSelectedDate(selectedDate.date) }}
            </h3>
            <div class="flex items-center gap-1 mb-6">
              <span class="text-slate-500 text-sm">{{ consultationDuration }} • </span>
              <PriceDisplay :amount="consultationPrice" class="text-slate-500 text-sm" />
            </div>

            <div class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-slate-900 mb-3">Available Times</label>
                
                <!-- Loading Time Slots -->
                <div v-if="loadingTimeSlots" class="text-center py-8 text-slate-500">
                  <div class="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-2"></div>
                  <p class="text-sm">Loading time slots...</p>
                </div>

                <!-- Error Loading Time Slots -->
                <div v-else-if="timeSlotsError" class="text-center py-8 text-slate-500">
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
                      'py-3 px-4 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-2',
                      !slot.available
                        ? 'bg-slate-50 text-slate-300 border-slate-100 decoration-slate-300 line-through'
                        : selectedTime === slot.time
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md'
                          : 'border-slate-200 hover:border-indigo-300 text-slate-600'
                    ]"
                  >
                    <Clock class="w-4 h-4" /> {{ slot.time }}
                  </button>
                </div>
                <div v-else class="text-center py-8 text-slate-500">
                  <p class="text-sm">No time slots available for this date.</p>
                </div>
              </div>

              <!-- Booking Form Step -->
              <form v-if="selectedTime && currentStep === 'booking'" @submit.prevent="handleBook" class="space-y-4 pt-6 border-t border-slate-100">
                <div>
                  <label class="block text-sm font-medium text-slate-900 mb-1">Your Name</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    required
                    class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-900 mb-1">Email Address</label>
                  <input
                    v-model="formData.email"
                    type="email"
                    required
                    class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-slate-900 mb-1">Topic (Optional)</label>
                  <textarea
                    v-model="formData.topic"
                    class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 h-24 resize-none"
                    placeholder="What would you like to discuss?"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {{ isSubmitting ? 'Processing...' : 'Continue to Payment' }}
                </button>
              </form>

              <!-- Payment Step -->
              <div v-if="currentStep === 'payment'" class="space-y-6 pt-6 border-t border-slate-100">
                <div>
                  <h3 class="text-lg font-bold text-slate-900 mb-4">Payment Information</h3>
                  
                  <!-- Billing Information -->
                  <div class="space-y-4 mb-6">
                    <div>
                      <label class="block text-sm font-medium text-slate-900 mb-1">Billing Name</label>
                      <input
                        v-model="billingInfo.name"
                        type="text"
                        required
                        class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-900 mb-1">Address Line 1</label>
                      <input
                        v-model="billingInfo.address_line1"
                        type="text"
                        required
                        class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="123 Main St"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-900 mb-1">Address Line 2 (Optional)</label>
                      <input
                        v-model="billingInfo.address_line2"
                        type="text"
                        class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        placeholder="Apt 4B"
                      />
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-slate-900 mb-1">City</label>
                        <input
                          v-model="billingInfo.city"
                          type="text"
                          required
                          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-900 mb-1">State</label>
                        <input
                          v-model="billingInfo.state"
                          type="text"
                          required
                          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-slate-900 mb-1">Postal Code</label>
                        <input
                          v-model="billingInfo.postal_code"
                          type="text"
                          required
                          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-slate-900 mb-1">Country</label>
                        <select
                          v-model="billingInfo.country"
                          required
                          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white"
                        >
                          <option value="">Select Country</option>
                          <option value="US">United States</option>
                          <option value="CA">Canada</option>
                          <option value="GB">United Kingdom</option>
                          <option value="AU">Australia</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="IT">Italy</option>
                          <option value="ES">Spain</option>
                          <option value="NL">Netherlands</option>
                          <option value="BE">Belgium</option>
                          <option value="CH">Switzerland</option>
                          <option value="AT">Austria</option>
                          <option value="SE">Sweden</option>
                          <option value="NO">Norway</option>
                          <option value="DK">Denmark</option>
                          <option value="FI">Finland</option>
                          <option value="IE">Ireland</option>
                          <option value="PT">Portugal</option>
                          <option value="GR">Greece</option>
                          <option value="PL">Poland</option>
                          <option value="CZ">Czech Republic</option>
                          <option value="HU">Hungary</option>
                          <option value="RO">Romania</option>
                          <option value="TR">Turkey</option>
                          <option value="JP">Japan</option>
                          <option value="CN">China</option>
                          <option value="KR">South Korea</option>
                          <option value="IN">India</option>
                          <option value="SG">Singapore</option>
                          <option value="MY">Malaysia</option>
                          <option value="TH">Thailand</option>
                          <option value="ID">Indonesia</option>
                          <option value="PH">Philippines</option>
                          <option value="VN">Vietnam</option>
                          <option value="NZ">New Zealand</option>
                          <option value="ZA">South Africa</option>
                          <option value="EG">Egypt</option>
                          <option value="AE">United Arab Emirates</option>
                          <option value="SA">Saudi Arabia</option>
                          <option value="IL">Israel</option>
                          <option value="BR">Brazil</option>
                          <option value="MX">Mexico</option>
                          <option value="AR">Argentina</option>
                          <option value="CL">Chile</option>
                          <option value="CO">Colombia</option>
                          <option value="PE">Peru</option>
                          <option value="RU">Russia</option>
                          <option value="UA">Ukraine</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <!-- Payment Info Notice -->
                  <div v-if="loadingPayment" class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-center gap-3">
                      <div class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p class="text-sm text-blue-800 font-medium">Redirecting to secure payment...</p>
                    </div>
                  </div>
                  <div v-else-if="paymentError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p class="text-sm text-red-600">{{ paymentError }}</p>
                    <button 
                      @click="initializePayment" 
                      class="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Try again
                    </button>
                  </div>
                  <div v-else class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p class="text-sm text-blue-800">
                      <ShieldCheck class="w-4 h-4 inline mr-2" />
                      You will be redirected to Stripe's secure checkout page to complete your payment.
                    </p>
                  </div>

                  <!-- Payment Summary -->
                  <div class="bg-slate-50 rounded-xl p-4 mb-6">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-sm text-slate-500">Session Duration:</span>
                      <span class="text-sm font-medium text-slate-900">{{ consultationDuration }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-slate-500">Total Amount:</span>
                      <PriceDisplay :amount="consultationPrice" class="text-lg font-bold text-slate-900" />
                    </div>
                  </div>

                  <!-- Complete Booking & Payment Button -->
                  <button
                    @click="handleCompletePayment"
                    :disabled="isSubmitting || loadingPayment || !billingInfoValid"
                    class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {{ loadingPayment ? 'Redirecting to Payment...' : 'Continue to Payment' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Login Modal -->
  <LoginModal
    :is-open="showLogin"
    @close="showLogin = false"
    @login-success="handleLoginSuccess"
    @switch-to-signup="handleSwitchToSignup"
  />

  <!-- Signup Modal -->
  <SignupModal
    :is-open="showSignup"
    @close="showSignup = false"
    @signup-success="handleSignupSuccess"
    @switch-to-login="handleSwitchToLogin"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch, inject, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Check,
  Info,
  ShieldCheck,
} from 'lucide-vue-next'
import { formatTimezoneLabel } from '@/utils/timezones'
import PriceDisplay from '../components/PriceDisplay.vue'
import LoginModal from '@/components/LoginModal.vue'
import SignupModal from '@/components/SignupModal.vue'
import { useConsultation } from '@/shared/influencer/composables/useConsultation'
import apiService from '@/services/api'
import { convertTime, formatTime12Hour, isTimeSlotPast, convertDateTimeToUTC } from '@/utils/timezone'
import eventBus from '@/utils/eventBus.js'
import toast from '@/utils/toast.js'

const emit = defineEmits(['back', 'book'])

const router = useRouter()
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
const showLogin = ref(false)
const showSignup = ref(false)
const isAuthenticated = ref(false)
const pendingBooking = ref(null)
const currentUserEmail = ref(null)

// Payment step state
const currentStep = ref('booking')
const orderId = ref(null)
const orderNumber = ref(null)
const invoiceId = ref(null)
const loadingPayment = ref(false)
const paymentError = ref(null)

// Timezone handling
const influencerTimezone = ref(null)
const customerTimezone = computed(() => Intl.DateTimeFormat().resolvedOptions().timeZone)

const formData = ref({
  name: '',
  email: '',
  topic: '',
})

const billingInfo = ref({
  name: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US',
})

const billingInfoValid = computed(() => {
  return billingInfo.value.name &&
    billingInfo.value.address_line1 &&
    billingInfo.value.city &&
    billingInfo.value.state &&
    billingInfo.value.postal_code &&
    billingInfo.value.country
})

// Calendar data from API
const calendarData = ref(null)
const today = new Date()
const currentMonth = ref(today.getMonth() + 1)
const currentYear = ref(today.getFullYear())

// Generate calendar days from API data
const calendarDays = computed(() => {
  if (!calendarData.value?.days) {
    const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1
      const date = formatDateLocal(currentYear.value, currentMonth.value - 1, day)
      const dateObj = new Date(currentYear.value, currentMonth.value - 1, day)
      dateObj.setHours(0, 0, 0, 0)
      const isPast = dateObj < today
      
      return { date, slotsAvailable: 0, status: isPast ? 'unavailable' : 'unavailable' }
    })
  }

  const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate()
  const apiDaysMap = new Map(calendarData.value.days.map(d => [d.date, d]))

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const date = formatDateLocal(currentYear.value, currentMonth.value - 1, day)
    const dateObj = new Date(currentYear.value, currentMonth.value - 1, day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
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

const formattedInfluencerTimezone = computed(() => {
  if (!influencerTimezone.value) return ''
  return formatTimezoneLabel(influencerTimezone.value)
})

const emptyDaysAtStart = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const dayOfWeek = firstDay.getDay()
  return dayOfWeek
})

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
  if (isSelected) return 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2'
  if (status === 'full' || status === 'unavailable') return 'bg-slate-100 text-slate-400 cursor-not-allowed'
  if (status === 'limited') return 'bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer'
  return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
}

const formatDateLocal = (year, month, day) => {
  const date = new Date(year, month, day)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatSelectedDate = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })
}

const goToPreviousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  selectedDate.value = null
  selectedTime.value = null
  fetchCalendarAvailability()
}

const goToNextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  selectedDate.value = null
  selectedTime.value = null
  fetchCalendarAvailability()
}

const fetchCalendarAvailability = async () => {
  if (!currentUsername.value || !consultation.value?.id) return

  loadingCalendar.value = true
  calendarError.value = null

  try {
    const result = await apiService.getConsultationCalendarAvailability(currentUsername.value, {
      month: `${currentYear.value}-${String(currentMonth.value).padStart(2, '0')}`,
    })

    if (result.success) {
      const data = result.data?.data || result.data
      calendarData.value = data
      
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

const fetchTimeSlots = async (date) => {
  if (!currentUsername.value || !date) return

  loadingTimeSlots.value = true
  timeSlotsError.value = null
  timeSlots.value = []

  try {
    const result = await apiService.getConsultationTimeSlots(currentUsername.value, {
      date,
    })

    if (result.success) {
      const data = result.data?.data || result.data
      
      if (data?.timezone && !influencerTimezone.value) {
        influencerTimezone.value = data.timezone
      }
      
      if (data?.timeSlots && influencerTimezone.value) {
        const isToday = isDateToday(date)
        
        timeSlots.value = data.timeSlots
          .map((slot, index) => {
            const slotTimeInInfluencerTZ = slot.time || ''
            const slotTimeInCustomerTZ = convertTime(
              slotTimeInInfluencerTZ,
              date,
              influencerTimezone.value,
              customerTimezone.value
            )
            
            let isAvailable = slot.available !== false
            if (isToday && isAvailable && slotTimeInInfluencerTZ) {
              isAvailable = !isTimeSlotPast(slotTimeInInfluencerTZ, date, influencerTimezone.value)
            }
            
            return {
              id: slotTimeInInfluencerTZ || `slot-${index}`,
              time: formatTime12Hour(slotTimeInCustomerTZ),
              available: isAvailable,
              rawTime: slotTimeInInfluencerTZ,
              rawTimeInCustomerTZ: slotTimeInCustomerTZ,
            }
          })
          .filter(slot => {
            if (isToday) {
              return slot.available
            }
            return true
          })
      } else if (data?.timeSlots && !influencerTimezone.value) {
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

const isDateToday = (dateString) => {
  const date = new Date(dateString + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)
  return date.getTime() === today.getTime()
}

const handleDateSelect = (day) => {
  if (day.status === 'full' || day.status === 'unavailable') return

  selectedDate.value = day
  selectedTime.value = null

  if (day.date) {
    fetchTimeSlots(day.date)
  }
}

const checkAuthStatus = async () => {
  try {
    isAuthenticated.value = await apiService.isAuthenticated()
    
    if (isAuthenticated.value) {
      try {
        const userResult = await apiService.getCurrentUser()
        if (userResult.success) {
          const userData = userResult.data || {}
          currentUserEmail.value = userData.email || null
        }
      } catch (error) {
        console.warn('Failed to fetch user email:', error)
      }
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    isAuthenticated.value = false
  }
}

const initializePayment = async () => {
  if (!consultation.value?.id) return
  
  if (loadingPayment.value) {
    return
  }

  if (!billingInfoValid.value) {
    toast.error('Please fill in all required billing information')
    return
  }

  loadingPayment.value = true
  paymentError.value = null

  try {
    let scheduledAtUTC

    if (pendingBooking.value?.scheduled_at) {
      scheduledAtUTC = pendingBooking.value.scheduled_at
    } else if (selectedDate.value && selectedTime.value && influencerTimezone.value) {
      const selectedSlot = timeSlots.value.find((s) => s.time === selectedTime.value)
      if (!selectedSlot) {
        throw new Error('Selected time slot not found')
      }

      const customerTime24 = selectedSlot.rawTimeInCustomerTZ
      if (!customerTime24) {
        throw new Error('Time slot time not found')
      }

      scheduledAtUTC = convertDateTimeToUTC(
        selectedDate.value.date,
        customerTime24,
        customerTimezone.value
      )

      if (!scheduledAtUTC) {
        throw new Error('Failed to convert booking time to UTC')
      }
    } else {
      throw new Error('Booking time information is missing')
    }

    const billingEmail = formData.value.email || currentUserEmail.value
    if (!billingEmail) {
      throw new Error('Email is required. Please enter your email in the booking form.')
    }
    
    sessionStorage.setItem('checkout_redirect_path', router.currentRoute.value.fullPath)
    
    const result = await apiService.bookAndPayConsultation(consultation.value.id, {
      scheduled_at: scheduledAtUTC,
      notes: formData.value.topic || null,
      billing_info: {
        ...billingInfo.value,
        email: billingEmail,
      },
      billing_email: billingEmail,
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to initialize payment')
    }

    const data = result.data?.data || result.data
    const redirectUrl = data.redirect_url || data.checkout_url
    
    if (!redirectUrl) {
      throw new Error('Payment redirect URL is missing. Please contact support.')
    }

    window.location.href = redirectUrl
  } catch (error) {
    console.error('Error initializing payment:', error)
    paymentError.value = error.message || 'Failed to initialize payment'
    toast.error(error.message || 'Failed to initialize payment')
    loadingPayment.value = false
  }
}

const handleCompletePayment = async () => {
  await initializePayment()
}

const viewOrder = () => {
  if (orderId.value) {
    router.push({
      path: '/profile',
      query: { tab: 'order-detail', orderId: orderId.value },
    })
  }
}

const proceedWithBooking = async () => {
  if (!pendingBooking.value) return

  if (!billingInfo.value.name) {
    billingInfo.value.name = formData.value.name
  }

  currentStep.value = 'payment'
  await initializePayment()
  
  pendingBooking.value = null
}

const handleBook = async () => {
  if (!selectedDate.value || !selectedTime.value || !consultation.value?.id || !influencerTimezone.value) return

  await checkAuthStatus()

  if (!isAuthenticated.value) {
    const selectedSlot = timeSlots.value.find((s) => s.time === selectedTime.value)
    if (!selectedSlot) {
      toast.error('Selected time slot not found')
      return
    }

    const customerTime24 = selectedSlot.rawTimeInCustomerTZ
    if (!customerTime24) {
      toast.error('Time slot time not found')
      return
    }

    const scheduledAtUTC = convertDateTimeToUTC(
      selectedDate.value.date,
      customerTime24,
      customerTimezone.value
    )

    if (!scheduledAtUTC) {
      toast.error('Failed to convert booking time to UTC')
      return
    }

    pendingBooking.value = {
      scheduled_at: scheduledAtUTC,
      notes: formData.value.topic || null,
    }
    showLogin.value = true
    return
  }

  if (!billingInfo.value.name) {
    billingInfo.value.name = formData.value.name
  }
  
  currentStep.value = 'payment'
}

const handleLoginSuccess = async (userData) => {
  showLogin.value = false
  isAuthenticated.value = true
  eventBus.emit('auth-success', userData)
  
  if (pendingBooking.value) {
    await proceedWithBooking()
  }
}

const handleSignupSuccess = async (userData) => {
  showSignup.value = false
  isAuthenticated.value = true
  eventBus.emit('auth-success', userData)
  
  if (pendingBooking.value) {
    await proceedWithBooking()
  }
}

const handleSwitchToSignup = () => {
  showLogin.value = false
  showSignup.value = true
}

const handleSwitchToLogin = () => {
  showSignup.value = false
  showLogin.value = true
}

watch(
  () => consultation.value,
  (consultation) => {
    if (consultation?.timezone && !influencerTimezone.value) {
      influencerTimezone.value = consultation.timezone
    }
    
    if (consultation?.id && currentUsername.value) {
      fetchCalendarAvailability()
    }
  },
  { immediate: true, deep: true }
)

watch(billingInfoValid, async (isValid) => {
  if (isValid && currentStep.value === 'payment' && !loadingPayment.value) {
    await nextTick()
    await initializePayment()
  }
}, { flush: 'post' })

onMounted(async () => {
  await checkAuthStatus()
  
  if (currentUsername.value) {
    await fetchConsultation(currentUsername.value)
  }
  
  eventBus.on('auth-success', async () => {
    await checkAuthStatus()
    if (pendingBooking.value && isAuthenticated.value) {
      await proceedWithBooking()
    }
  })
})

onBeforeUnmount(() => {
  eventBus.off('auth-success')
})
</script>

