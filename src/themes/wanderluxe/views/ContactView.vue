<template>
  <div class="pt-24 pb-20 px-4 lg:px-12 xl:px-16 2xl:px-24 max-w-7xl mx-auto min-h-screen">
    <!-- Success State -->
    <div v-if="submitted" class="min-h-[60vh] flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle class="w-12 h-12" />
      </div>
      <h2 class="text-3xl font-bold text-slate-900 mb-4">Message Sent!</h2>
      <p class="text-slate-500 max-w-md mb-8">Thanks for reaching out. I'll get back to you as soon as possible.</p>
      <button
        @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
        class="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
      >
        Return to Home
      </button>
    </div>

    <!-- Contact Form -->
    <div v-else>
      <button
        @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
        class="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors"
      >
        <ChevronLeft class="w-4 h-4" /> Back to Home
      </button>

      <h1 class="text-3xl font-bold text-slate-900 mb-2">Get in touch</h1>
      <p v-if="contactInfo.contact_message" class="text-slate-500 mb-8">
        {{ contactInfo.contact_message }}
      </p>
      <p v-else class="text-slate-500 mb-8">
        For business inquiries, collaborations, or just to say hi.
      </p>
      
      <form @submit.prevent="handleSubmit" class="space-y-6 mb-12">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Name</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="Your name"
            />
          </div>
          <div>
            <label class="block text-sm font-bold text-slate-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="email@example.com"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Subject</label>
          <select
            v-model="form.subject"
            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none bg-white"
          >
            <option value="general">General Inquiry</option>
            <option value="business">Brand Partnership</option>
            <option value="course">Consultation Question</option>
            <option value="press">Press / Media</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Message</label>
          <textarea
            v-model="form.message"
            rows="5"
            required
            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none resize-none"
            placeholder="How can I help you?"
          ></textarea>
        </div>
        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span v-if="submitting">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Sending...
          </span>
          <span v-else class="flex items-center gap-2">
            Send Message
            <Send class="w-4 h-4" />
          </span>
        </button>
      </form>

      <!-- Contact Information -->
      <div v-if="contactInfo.contact_email || contactInfo.contact_location || contactInfo.contact_phone" class="pt-12 border-t border-slate-100 grid grid-cols-2 gap-8 text-center">
        <div v-if="contactInfo.contact_email">
          <Mail class="w-6 h-6 mx-auto mb-2 text-slate-400" />
          <p class="font-bold text-slate-900">Email</p>
          <a :href="`mailto:${contactInfo.contact_email}`" class="text-slate-500 text-sm hover:text-slate-900 transition-colors">
            {{ contactInfo.contact_email }}
          </a>
        </div>
        <div v-if="contactInfo.contact_location">
          <MapPin class="w-6 h-6 mx-auto mb-2 text-slate-400" />
          <p class="font-bold text-slate-900">Location</p>
          <p class="text-slate-500 text-sm">{{ contactInfo.contact_location }}</p>
        </div>
        <div v-if="contactInfo.contact_phone" class="col-span-2">
          <Phone class="w-6 h-6 mx-auto mb-2 text-slate-400" />
          <p class="font-bold text-slate-900">Phone</p>
          <a :href="`tel:${contactInfo.contact_phone}`" class="text-slate-500 text-sm hover:text-slate-900 transition-colors">
            {{ contactInfo.contact_phone }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronLeft, CheckCircle, Mail, MapPin, Phone, Send } from 'lucide-vue-next'
import apiService from '@/services/api'
import toast from '@/utils/toast'

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || route.params.username)

const submitted = ref(false)
const submitting = ref(false)
const contactInfo = ref({
  contact_email: null,
  contact_location: null,
  contact_phone: null,
  contact_message: null
})
const loadingContactInfo = ref(false)

const form = ref({
  name: '',
  email: '',
  subject: 'general',
  message: ''
})

const loadContactInfo = async () => {
  if (!currentUsername.value) return
  
  loadingContactInfo.value = true
  try {
    const result = await apiService.getPublicContactInfo(currentUsername.value)
    if (result.success) {
      // Handle double-wrapped response
      const data = result.data?.data || result.data || {}
      contactInfo.value = {
        contact_email: data.contact_email || null,
        contact_location: data.contact_location || null,
        contact_phone: data.contact_phone || null,
        contact_message: data.contact_message || null
      }
    }
  } catch (error) {
    console.error('Error loading contact info:', error)
    // Silently fail - contact info is optional
  } finally {
    loadingContactInfo.value = false
  }
}

const handleSubmit = async () => {
  if (submitting.value) return
  
  submitting.value = true
  
  try {
    const result = await apiService.submitContactForm(currentUsername.value, {
      name: form.value.name,
      email: form.value.email,
      subject: form.value.subject,
      message: form.value.message
    })
    
    if (result.success) {
      submitted.value = true
      toast.success(result.message || 'Your message has been sent successfully')
    } else {
      toast.error(result.error || 'Failed to send message. Please try again.')
    }
  } catch (error) {
    console.error('Error submitting contact form:', error)
    toast.error(error.message || 'Failed to send message. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadContactInfo()
})
</script>

