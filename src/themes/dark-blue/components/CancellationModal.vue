<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80]"
      @click="$emit('close')"
    />
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none"
    >
      <div class="bg-white rounded-3xl w-full max-w-2xl shadow-2xl pointer-events-auto flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-3xl">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-primary">Cancel {{ cancellationType }}</h2>
            <p class="text-text-muted mt-2">Review the cancellation policy before proceeding</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X class="w-6 h-6 text-text-muted" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <!-- Cancellation Policy Display -->
          <div v-if="policy" class="bg-blue-50 rounded-2xl p-6 border border-blue-200">
            <h3 class="font-bold text-primary mb-4 flex items-center gap-2">
              <Info class="w-5 h-5 text-blue-600" />
              Cancellation Policy
            </h3>
            
            <div class="space-y-4">
              <!-- Hours Until Consultation -->
              <div v-if="hoursUntilConsultation !== null" class="flex items-center justify-between p-3 bg-white rounded-xl">
                <span class="text-text-muted">Time Until Consultation:</span>
                <span class="font-bold text-primary">
                  {{ formatHoursUntilConsultation(hoursUntilConsultation) }}
                </span>
              </div>

              <!-- Refund Percentage -->
              <div v-if="policy.refund_percentage !== undefined" class="flex items-center justify-between p-3 bg-white rounded-xl">
                <span class="text-text-muted">Refund Percentage:</span>
                <span class="font-bold text-primary">{{ policy.refund_percentage }}%</span>
              </div>

              <!-- Refund Amount -->
              <div v-if="policy.refund_amount_cents !== undefined" class="flex items-center justify-between p-3 bg-white rounded-xl">
                <span class="text-text-muted">Refund Amount:</span>
                <PriceDisplay
                  :amount="policy.refund_amount_cents / 100"
                  class="font-bold text-green-600 text-lg"
                />
              </div>

              <!-- Policy Rules Breakdown -->
              <div v-if="policy.policy_description" class="mt-4 p-4 bg-white rounded-xl">
                <p class="text-sm text-text-muted leading-relaxed">{{ policy.policy_description }}</p>
              </div>

              <!-- No Refund Warning -->
              <div v-if="policy.no_refund" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p class="text-sm text-red-800 font-semibold flex items-center gap-2">
                  <AlertCircle class="w-5 h-5" />
                  ⚠️ No refund available for this cancellation.
                </p>
              </div>
            </div>
          </div>

          <!-- Loading Policy State -->
          <div v-else-if="loadingPolicy" class="bg-blue-50 rounded-2xl p-6 border border-blue-200 text-center">
            <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-text-muted">Loading cancellation policy...</p>
          </div>

          <!-- Cancellation Form -->
          <div class="space-y-6">
            <h3 class="font-bold text-primary text-lg">Cancellation Details</h3>

            <!-- Reason Selection -->
            <div>
              <label class="block text-sm font-medium text-primary mb-2">
                Cancellation Reason <span class="text-red-600">*</span>
              </label>
              <select
                v-model="form.reason"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white"
                :class="{ 'border-red-300': errors.reason }"
              >
                <option value="">Select a reason</option>
                <option value="requested_by_customer">Requested by Customer</option>
                <option value="requested_by_influencer">Requested by Influencer</option>
                <option value="emergency">Emergency</option>
                <option value="schedule_conflict">Schedule Conflict</option>
                <option value="other">Other</option>
              </select>
              <p v-if="errors.reason" class="mt-1 text-sm text-red-600">{{ errors.reason }}</p>
            </div>

            <!-- Description Textarea -->
            <div>
              <label class="block text-sm font-medium text-primary mb-2">
                Additional Details <span class="text-text-muted text-xs">(Optional)</span>
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                placeholder="Provide any additional information about the cancellation..."
              ></textarea>
            </div>

            <!-- Confirmation Checkbox -->
            <div class="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <input
                id="confirm-cancellation"
                v-model="form.confirmed"
                type="checkbox"
                class="mt-1 w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary/50"
                :class="{ 'border-red-300': errors.confirmed }"
              />
              <label for="confirm-cancellation" class="flex-1 text-sm text-text-muted cursor-pointer">
                <span class="font-medium text-primary">I understand</span> that this cancellation is final and cannot be undone. 
                <span v-if="policy && !policy.no_refund && policy.refund_amount_cents">
                  I will receive a refund of <PriceDisplay :amount="policy.refund_amount_cents / 100" class="font-semibold text-green-600" /> 
                  <span v-if="policy.refund_percentage !== 100">({{ policy.refund_percentage }}% of the total)</span>.
                </span>
                <span v-else-if="policy && policy.no_refund" class="text-red-600 font-semibold">
                  No refund will be issued for this cancellation.
                </span>
              </label>
            </div>
            <p v-if="errors.confirmed" class="text-sm text-red-600">{{ errors.confirmed }}</p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex gap-4 justify-end">
          <button
            @click="$emit('close')"
            :disabled="processing"
            class="px-6 py-3 bg-white text-primary border-2 border-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Keep {{ cancellationType }}
          </button>
          <button
            @click="handleSubmit"
            :disabled="processing || !isFormValid"
            class="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <span v-if="processing" class="flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Cancelling...
            </span>
            <span v-else>Cancel {{ cancellationType }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Teleport } from 'vue'
import { X, Info, AlertCircle } from 'lucide-vue-next'
import PriceDisplay from './PriceDisplay.vue'
import apiService from '@/services/api.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  cancellationType: {
    type: String,
    default: 'Booking', // 'Booking' or 'Order'
  },
  bookingId: {
    type: [Number, String],
    default: null,
  },
  scheduledAt: {
    type: String,
    default: null, // ISO date string for consultation
  },
  orderId: {
    type: [Number, String],
    default: null,
  },
})

const emit = defineEmits(['close', 'confirm'])

// State
const policy = ref(null)
const loadingPolicy = ref(false)
const processing = ref(false)
const form = ref({
  reason: '',
  description: '',
  confirmed: false,
})
const errors = ref({
  reason: '',
  confirmed: '',
})

// Computed
const hoursUntilConsultation = computed(() => {
  if (!props.scheduledAt) return null
  
  const scheduled = new Date(props.scheduledAt)
  const now = new Date()
  const diffMs = scheduled - now
  const diffHours = diffMs / (1000 * 60 * 60)
  
  return diffHours
})

const isFormValid = computed(() => {
  return form.value.reason && form.value.confirmed && !processing.value
})

// Methods
const formatHoursUntilConsultation = (hours) => {
  if (hours < 0) return 'Past due'
  if (hours < 1) return 'Less than 1 hour'
  if (hours < 24) return `${Math.floor(hours)} hour${Math.floor(hours) !== 1 ? 's' : ''}`
  const days = Math.floor(hours / 24)
  const remainingHours = Math.floor(hours % 24)
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`
  }
  return `${days} day${days !== 1 ? 's' : ''}, ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`
}

const fetchCancellationPolicy = async () => {
  if (!props.bookingId) {
    // For orders without consultation bookings, set a default policy
    policy.value = {
      refund_percentage: 100,
      refund_amount_cents: 0, // Will be calculated from order if needed
      policy_description: 'Full refund available for order cancellations made before payment processing.',
      no_refund: false,
    }
    return
  }

  loadingPolicy.value = true
  try {
    const result = await apiService.getConsultationBookingCancellationPolicy(props.bookingId)
    if (result.success) {
      policy.value = result.data?.data || result.data
    } else {
      // Fallback policy
      policy.value = {
        refund_percentage: 100,
        refund_amount_cents: 0,
        policy_description: 'Refund policy information is not available. Please contact support for details.',
        no_refund: false,
      }
    }
  } catch (err) {
    console.warn('Could not fetch cancellation policy:', err)
    // Set default policy
    policy.value = {
      refund_percentage: 100,
      refund_amount_cents: 0,
      policy_description: 'Refund policy information is being loaded...',
      no_refund: false,
    }
  } finally {
    loadingPolicy.value = false
  }
}

const validateForm = () => {
  errors.value = { reason: '', confirmed: '' }
  let isValid = true

  if (!form.value.reason) {
    errors.value.reason = 'Please select a cancellation reason.'
    isValid = false
  }

  if (!form.value.confirmed) {
    errors.value.confirmed = 'Please confirm that you understand the cancellation policy.'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  processing.value = true
  try {
    const cancellationData = {
      reason: form.value.reason,
      description: form.value.description || null,
    }

    emit('confirm', cancellationData)
  } catch (err) {
    console.error('Error submitting cancellation:', err)
  } finally {
    processing.value = false
  }
}

const resetForm = () => {
  form.value = {
    reason: '',
    description: '',
    confirmed: false,
  }
  errors.value = {
    reason: '',
    confirmed: '',
  }
  policy.value = null
}

// Watch for modal open/close
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
    fetchCancellationPolicy()
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>

