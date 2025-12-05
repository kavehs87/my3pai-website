<template>
  <div v-if="isBooked" class="min-h-screen pt-36 pb-12 flex flex-col items-center justify-center container mx-auto px-4">
    <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
      <Check class="w-10 h-10" />
    </div>
    <h2 class="text-3xl font-bold text-primary mb-2">Booking & Payment Confirmed!</h2>
    <p class="text-text-muted text-center max-w-md mb-4">
      You're all set for your 1:1 consultation. A calendar invitation has been sent to your email.
    </p>
    <div v-if="orderNumber" class="text-center mb-6">
      <p class="text-sm text-text-muted mb-2">Order Number:</p>
      <p class="text-lg font-bold text-primary">{{ orderNumber }}</p>
    </div>
    <div class="flex flex-col sm:flex-row gap-4">
      <button 
        v-if="orderId" 
        @click="viewOrder" 
        class="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-colors"
      >
        View Order Details
      </button>
      <button 
        v-if="invoiceId" 
        @click="downloadInvoice" 
        class="bg-white text-primary border-2 border-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/5 transition-colors"
      >
        Download Invoice
      </button>
    <button @click="$emit('back')" class="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
      Return to Profile
    </button>
    </div>
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
          <div class="mb-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <button
                  @click="goToPreviousMonth"
                  class="p-2 rounded-lg hover:bg-slate-50 transition-colors text-text-muted hover:text-primary"
                  :disabled="loadingCalendar"
                  aria-label="Previous month"
                >
                  <ChevronLeft class="w-5 h-5" />
                </button>
                <h3 class="text-xl font-bold text-primary flex items-center gap-2 min-w-[200px] justify-center">
                  <CalendarIcon class="w-5 h-5 text-secondary" />
                  {{ currentMonthYear }}
                </h3>
                <button
                  @click="goToNextMonth"
                  class="p-2 rounded-lg hover:bg-slate-50 transition-colors text-text-muted hover:text-primary"
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

              <!-- Booking Form Step -->
              <form v-if="selectedTime && currentStep === 'booking'" @submit.prevent="handleBook" class="space-y-4 pt-6 border-t border-slate-100">
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
                  {{ isSubmitting ? 'Processing...' : 'Continue to Payment' }}
                </button>
              </form>

              <!-- Payment Step -->
              <div v-if="currentStep === 'payment'" class="space-y-6 pt-6 border-t border-slate-100">
                <div>
                  <h3 class="text-lg font-bold text-primary mb-4">Payment Information</h3>
                  
                  <!-- Billing Information -->
                  <div class="space-y-4 mb-6">
                    <div>
                      <label class="block text-sm font-medium text-primary mb-1">Billing Name</label>
                      <input
                        v-model="billingInfo.name"
                        type="text"
                        required
                        class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        placeholder="John Doe"
                      />
            </div>
                    <div>
                      <label class="block text-sm font-medium text-primary mb-1">Address Line 1</label>
                      <input
                        v-model="billingInfo.address_line1"
                        type="text"
                        required
                        class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        placeholder="123 Main St"
                      />
          </div>
                    <div>
                      <label class="block text-sm font-medium text-primary mb-1">Address Line 2 (Optional)</label>
                      <input
                        v-model="billingInfo.address_line2"
                        type="text"
                        class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                        placeholder="Apt 4B"
                      />
        </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-primary mb-1">City</label>
                        <input
                          v-model="billingInfo.city"
                          type="text"
                          required
                          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                          placeholder="New York"
                        />
      </div>
                      <div>
                        <label class="block text-sm font-medium text-primary mb-1">State</label>
                        <input
                          v-model="billingInfo.state"
                          type="text"
                          required
                          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                          placeholder="NY"
                        />
    </div>
  </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-primary mb-1">Postal Code</label>
                        <input
                          v-model="billingInfo.postal_code"
                          type="text"
                          required
                          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50"
                          placeholder="10001"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-primary mb-1">Country</label>
                        <select
                          v-model="billingInfo.country"
                          required
                          class="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-white"
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

                  <!-- Stripe Card Element -->
                  <div>
                    <label class="block text-sm font-medium text-primary mb-3">Card Information</label>
                    <div v-if="loadingPayment" class="text-center py-8 text-text-muted">
                      <div class="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-2"></div>
                      <p class="text-sm">Loading payment form...</p>
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
                    <div v-else-if="!paymentIntent" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p class="text-sm text-blue-800">Please fill in all billing information above to continue.</p>
                    </div>
                    <!-- Always render the container when paymentIntent exists - use v-show to keep it in DOM -->
                    <div v-show="paymentIntent">
                      <!-- Always render the container element so it exists in DOM when we mount Stripe -->
                      <div 
                        ref="stripeCardElementRef" 
                        id="stripe-card-element" 
                        class="mb-4 min-h-[40px]"
                      >
                        <!-- Stripe Card Element will be inserted here -->
                      </div>
                    </div>
                  </div>

                  <!-- Payment Summary -->
                  <div class="bg-slate-50 rounded-xl p-4 mb-6">
                    <div class="flex justify-between items-center mb-2">
                      <span class="text-sm text-text-muted">Session Duration:</span>
                      <span class="text-sm font-medium text-primary">{{ consultationDuration }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-sm text-text-muted">Total Amount:</span>
                      <PriceDisplay :amount="consultationPrice" class="text-lg font-bold text-primary" />
                    </div>
                  </div>

                  <!-- Complete Booking & Payment Button -->
                  <button
                    @click="handleCompletePayment"
                    :disabled="isSubmitting || loadingPayment || !billingInfoValid || !paymentIntent"
                    class="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {{ isSubmitting ? 'Processing Payment...' : loadingPayment ? 'Initializing Payment...' : 'Complete Booking & Payment' }}
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
import { ArrowLeft, CalendarIcon, Clock, Check, ChevronLeft, ChevronRight, Info } from 'lucide-vue-next'
import { formatTimezoneLabel } from '@/utils/timezones'
import PriceDisplay from '../components/PriceDisplay.vue'
import LoginModal from '@/components/LoginModal.vue'
import SignupModal from '@/components/SignupModal.vue'
import { useConsultation } from '@/shared/influencer/composables/useConsultation'
import api from '@/services/api'
import { convertTime, formatTime12Hour, isTimeSlotPast, convertDateTimeToUTC } from '@/utils/timezone'
import eventBus from '@/utils/eventBus.js'
import { loadStripe } from '@stripe/stripe-js'
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
const pendingBooking = ref(null) // Store booking data when user needs to login first
const currentUserEmail = ref(null) // Store authenticated user's email

// Payment step state
const currentStep = ref('booking') // 'booking' or 'payment'
const orderId = ref(null)
const orderNumber = ref(null)
const invoiceId = ref(null)
const paymentIntent = ref(null)
const loadingPayment = ref(false)
const paymentError = ref(null)

// Stripe Elements
const stripe = ref(null)
const cardElement = ref(null)
const stripeCardElementRef = ref(null)

// Timezone handling - all conversions done on UI side
const influencerTimezone = ref(null) // Will be set from API response
const customerTimezone = computed(() => Intl.DateTimeFormat().resolvedOptions().timeZone) // Browser timezone

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

// Formatted influencer timezone for display
const formattedInfluencerTimezone = computed(() => {
  if (!influencerTimezone.value) return ''
  return formatTimezoneLabel(influencerTimezone.value)
})

// Calculate empty days at the start of the month (for proper calendar alignment)
const emptyDaysAtStart = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value - 1, 1)
  const dayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.
  return dayOfWeek
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

// Navigate to previous month
const goToPreviousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value--
  } else {
    currentMonth.value--
  }
  // Reset selected date when changing months
  selectedDate.value = null
  selectedTime.value = null
  fetchCalendarAvailability()
}

// Navigate to next month
const goToNextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value++
  } else {
    currentMonth.value++
  }
  // Reset selected date when changing months
  selectedDate.value = null
  selectedTime.value = null
  fetchCalendarAvailability()
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

// Check authentication status
const checkAuthStatus = async () => {
  try {
    isAuthenticated.value = await api.isAuthenticated()
    
    // If authenticated, get user email as fallback
    if (isAuthenticated.value) {
      try {
        const userResult = await api.getCurrentUser()
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

// Initialize Stripe payment
const initializePayment = async () => {
  if (!consultation.value?.id) return
  
  // Prevent multiple simultaneous initializations
  if (loadingPayment.value || paymentIntent.value) {
    return
  }

  loadingPayment.value = true
  paymentError.value = null

  try {
    let scheduledAtUTC

    // Use stored scheduled_at from pendingBooking if available (after login)
    if (pendingBooking.value?.scheduled_at) {
      scheduledAtUTC = pendingBooking.value.scheduled_at
    } else if (selectedDate.value && selectedTime.value && influencerTimezone.value) {
      // Calculate from selected date/time
    const selectedSlot = timeSlots.value.find((s) => s.time === selectedTime.value)
    if (!selectedSlot) {
      throw new Error('Selected time slot not found')
    }

    const customerTime24 = selectedSlot.rawTimeInCustomerTZ
    if (!customerTime24) {
      throw new Error('Time slot time not found')
    }

    // Convert from customer's timezone to UTC for booking
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

    // Get billing email from form data (user entered in booking form)
    // Fallback to authenticated user's email if form email is not available
    const billingEmail = formData.value.email || currentUserEmail.value
    if (!billingEmail) {
      throw new Error('Email is required. Please enter your email in the booking form.')
    }
    
    // Call book-and-pay endpoint to create booking + order + payment intent
    const result = await api.bookAndPayConsultation(consultation.value.id, {
      scheduled_at: scheduledAtUTC,
      notes: formData.value.topic || null,
      billing_info: {
        ...billingInfo.value,
        email: billingEmail, // Include email in billing_info
      },
      billing_email: billingEmail, // Also include as separate field for backend compatibility
    })

    if (!result.success) {
      throw new Error(result.error || 'Failed to initialize payment')
    }

    // Extract data from response
    const data = result.data?.data || result.data
    orderId.value = data.order_id || data.order?.id
    orderNumber.value = data.order_number || data.order?.order_number
    invoiceId.value = data.invoice_id || data.invoice?.id
    
    // Set payment intent first to trigger DOM rendering
    paymentIntent.value = data.payment_intent || data

    if (!paymentIntent.value?.client_secret) {
      throw new Error('Payment intent client secret is missing')
    }

    // Initialize Stripe.js first (before waiting for DOM)
    const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!stripePublishableKey) {
      throw new Error('Stripe publishable key is not configured')
    }

    const stripeInstance = await loadStripe(stripePublishableKey)
    if (!stripeInstance) {
      throw new Error('Failed to load Stripe.js')
    }

    stripe.value = stripeInstance

    // Wait for Vue to update the DOM and render the container
    // Use multiple nextTick calls and longer waits to ensure DOM is updated
    await nextTick()
    await nextTick() // Double nextTick for safety
    await new Promise(resolve => setTimeout(resolve, 500)) // Longer wait

    // Mount Stripe card element - try multiple times with retries
    let cardElementContainer = stripeCardElementRef.value || document.getElementById('stripe-card-element')
    
    // Retry logic if element not found immediately
    const maxRetries = 5
    for (let i = 0; i < maxRetries && !cardElementContainer; i++) {
      await new Promise(resolve => setTimeout(resolve, 200 * (i + 1)))
      cardElementContainer = stripeCardElementRef.value || document.getElementById('stripe-card-element')
    }
    
    if (!cardElementContainer) {
      console.error('Stripe card element container not found after retries')
      console.error('Template ref:', stripeCardElementRef.value)
      console.error('Element by ID:', document.getElementById('stripe-card-element'))
      console.error('Payment intent:', paymentIntent.value)
      console.error('Current step:', currentStep.value)
      throw new Error('Stripe card element container not found. Please refresh the page and try again.')
    }

    // Create and mount Stripe card element
    // If element is found, mount it; otherwise the watcher will handle it
    if (cardElementContainer) {
      const elements = stripe.value.elements()
      cardElement.value = elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1e293b',
            '::placeholder': {
              color: '#94a3b8',
            },
          },
          invalid: {
            color: '#ef4444',
          },
        },
      })
      cardElement.value.mount('#stripe-card-element')
    } else {
      // Element not found, but paymentIntent is set, so the watcher will handle mounting
      console.log('Element not found in initializePayment, watcher will handle mounting')
    }
  } catch (error) {
    console.error('Error initializing payment:', error)
    paymentError.value = error.message || 'Failed to initialize payment'
    toast.error(error.message || 'Failed to initialize payment')
  } finally {
    loadingPayment.value = false
  }
}

// Handle complete payment
const handleCompletePayment = async () => {
  if (!billingInfoValid.value) {
    toast.error('Please fill in all required billing information')
    return
  }

  if (!paymentIntent.value) {
    toast.error('Payment form is not ready. Please wait a moment.')
    return
  }

  // Complete the payment
  await completeBookingAndPayment()
}

// Complete booking and payment
const completeBookingAndPayment = async () => {
  if (!paymentIntent.value || !stripe.value || !cardElement.value) {
    toast.error('Payment form is not ready. Please wait a moment and try again.')
    return
  }

  if (!billingInfoValid.value) {
    toast.error('Please fill in all required billing information')
    return
  }

  isSubmitting.value = true
  paymentError.value = null

  try {
    const paymentIntentId = paymentIntent.value.payment_intent_id || paymentIntent.value.id
    if (!paymentIntentId) {
      throw new Error('Payment intent ID is missing')
    }

    // Confirm payment with Stripe.js
    const { error, paymentIntent: confirmedIntent } = await stripe.value.confirmCardPayment(
      paymentIntent.value.client_secret,
      {
        payment_method: {
          card: cardElement.value,
          billing_details: {
            name: billingInfo.value.name,
            email: formData.value.email,
            address: {
              line1: billingInfo.value.address_line1,
              line2: billingInfo.value.address_line2 || undefined,
              city: billingInfo.value.city,
              state: billingInfo.value.state,
              postal_code: billingInfo.value.postal_code,
              country: billingInfo.value.country,
            },
          },
        },
      }
    )

    if (error) {
      throw new Error(error.message || 'Payment failed')
    }

    if (!confirmedIntent || confirmedIntent.status !== 'succeeded') {
      throw new Error(`Payment status is '${confirmedIntent?.status || 'unknown'}', expected 'succeeded'`)
    }

    // Confirm payment with backend
    const confirmResult = await api.confirmPayment({
      payment_intent_id: paymentIntentId,
      order_id: orderId.value,
    })

    if (!confirmResult.success) {
      throw new Error(confirmResult.error || 'Payment confirmation failed')
    }

    // Update invoice ID if provided in confirmation response
    const confirmData = confirmResult.data?.data || confirmResult.data
    if (confirmData?.invoice_id) {
      invoiceId.value = confirmData.invoice_id
    }

    toast.success('Payment successful!')
      isBooked.value = true
      emit('book')
    
      // Refresh calendar to update availability
      await fetchCalendarAvailability()
  } catch (error) {
    console.error('Error completing payment:', error)
    paymentError.value = error.message || 'Failed to complete payment'
    toast.error(error.message || 'Failed to complete payment')
  } finally {
    isSubmitting.value = false
  }
}

// View order details
const viewOrder = () => {
  if (orderId.value) {
    router.push({
      path: '/profile',
      query: { tab: 'order-detail', orderId: orderId.value },
    })
  }
}

// Download invoice
const downloadInvoice = async () => {
  if (!invoiceId.value) return

  try {
    const result = await api.downloadInvoice(invoiceId.value)
    if (result.success && result.data instanceof Blob) {
      const url = window.URL.createObjectURL(result.data)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceId.value}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Invoice downloaded')
    } else {
      throw new Error('Failed to download invoice')
    }
  } catch (error) {
    console.error('Error downloading invoice:', error)
    toast.error(error.message || 'Failed to download invoice')
  }
}

// Store booking data and proceed with booking (for legacy flow if needed)
const proceedWithBooking = async () => {
  if (!pendingBooking.value) return

  // Pre-fill billing info
  if (!billingInfo.value.name) {
    billingInfo.value.name = formData.value.name
  }

  // Move to payment step
  currentStep.value = 'payment'
  await initializePayment()
  
  pendingBooking.value = null
}

const handleBook = async () => {
  if (!selectedDate.value || !selectedTime.value || !consultation.value?.id || !influencerTimezone.value) return

  // Check authentication first
  await checkAuthStatus()

  if (!isAuthenticated.value) {
    // Store booking data for after login
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

    // Store booking data and show login modal
    pendingBooking.value = {
      scheduled_at: scheduledAtUTC,
      notes: formData.value.topic || null,
    }
    showLogin.value = true
    return
  }

  // User is authenticated, proceed to payment step
  // Pre-fill billing info with form data
  if (!billingInfo.value.name) {
    billingInfo.value.name = formData.value.name
  }
  if (!billingInfo.value.email) {
    // Note: billing email is not in billingInfo, but we use formData.email
  }
  
  // Move to payment step
  currentStep.value = 'payment'
  
  // Initialize payment (Stripe Elements) - this will be called when user fills billing info
  // We'll wait for user to fill billing info before calling the API
}

// Handle successful login
const handleLoginSuccess = async (userData) => {
  showLogin.value = false
  isAuthenticated.value = true
  eventBus.emit('auth-success', userData)
  
  // If there's a pending booking, proceed with it
  if (pendingBooking.value) {
    await proceedWithBooking()
  }
}

// Handle successful signup
const handleSignupSuccess = async (userData) => {
  showSignup.value = false
  isAuthenticated.value = true
  eventBus.emit('auth-success', userData)
  
  // If there's a pending booking, proceed with it
  if (pendingBooking.value) {
    await proceedWithBooking()
  }
}

// Switch between login and signup modals
const handleSwitchToSignup = () => {
  showLogin.value = false
  showSignup.value = true
}

const handleSwitchToLogin = () => {
  showSignup.value = false
  showLogin.value = true
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
  // Check authentication status on mount
  await checkAuthStatus()
  
  if (currentUsername.value) {
    // No timezone parameter - backend returns data in influencer's timezone
    await fetchConsultation(currentUsername.value)
  }
  
  // Listen for auth success events (e.g., from other components)
  eventBus.on('auth-success', async () => {
    await checkAuthStatus()
    // If there's a pending booking, proceed with it
    if (pendingBooking.value && isAuthenticated.value) {
      await proceedWithBooking()
    }
  })
})

// Watch for billing info to be complete and auto-initialize payment
watch(billingInfoValid, async (isValid) => {
  if (isValid && currentStep.value === 'payment' && !paymentIntent.value && !loadingPayment.value) {
    // Auto-initialize payment when billing info is complete
    // Use flush: 'post' to ensure DOM is updated
    await nextTick()
    await initializePayment()
  }
}, { flush: 'post' })

// Watch paymentIntent to mount Stripe after it's set and DOM is updated
watch(paymentIntent, async (newIntent) => {
  if (newIntent && stripe.value && !cardElement.value && currentStep.value === 'payment') {
    // Payment intent is set, now mount Stripe element
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const cardElementContainer = stripeCardElementRef.value || document.getElementById('stripe-card-element')
    if (cardElementContainer && stripe.value) {
      try {
        const elements = stripe.value.elements()
        cardElement.value = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#1e293b',
              '::placeholder': {
                color: '#94a3b8',
              },
            },
            invalid: {
              color: '#ef4444',
            },
          },
        })
        cardElement.value.mount('#stripe-card-element')
      } catch (error) {
        console.error('Error mounting Stripe card element:', error)
      }
    }
  }
}, { flush: 'post' })

onBeforeUnmount(() => {
  // Cleanup Stripe Elements
  if (cardElement.value) {
    try {
      cardElement.value.unmount()
    } catch (error) {
      console.warn('Error unmounting Stripe card element:', error)
    }
    cardElement.value = null
  }
  stripe.value = null
})
</script>

