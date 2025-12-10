<template>
  <div class="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-surface">
    <!-- Success State -->
    <div v-if="submitted" class="min-h-screen flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
        <i class="fas fa-check-circle text-4xl"></i>
      </div>
      <h2 class="text-3xl font-bold text-primary mb-4">Message Sent!</h2>
      <p class="text-text-muted max-w-md mb-8">Thanks for reaching out. I'll get back to you as soon as possible.</p>
      <button
        @click="router.push({ name: 'influencer-home', params: { username: route.params.username } })"
        class="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
      >
        Return to Home
      </button>
    </div>

    <!-- Contact Form -->
    <div v-else>
      <button
        @click="router.push({ name: 'influencer-home', params: { username: route.params.username } })"
        class="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" /> Back to Home
      </button>

      <div class="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
        <!-- Left Column -->
        <div>
          <h1 class="text-4xl font-extrabold text-primary mb-4">Get in touch</h1>
          <p v-if="contactInfo.contact_message" class="text-lg text-text-muted mb-8 leading-relaxed">
            {{ contactInfo.contact_message }}
          </p>
          <p v-else class="text-lg text-text-muted mb-8 leading-relaxed">
            Have a question about a course, need a custom itinerary, or want to collaborate? Fill out the form or reach out directly via email.
          </p>

          <div class="space-y-6 mb-12">
            <!-- Email Contact -->
            <div v-if="contactInfo.contact_email" class="flex items-start gap-4">
              <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fas fa-envelope text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-primary">Email</h3>
                <a :href="`mailto:${contactInfo.contact_email}`" class="text-text-muted hover:text-primary transition-colors">
                  {{ contactInfo.contact_email }}
                </a>
              </div>
            </div>

            <!-- Location -->
            <div v-if="contactInfo.contact_location" class="flex items-start gap-4">
              <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fas fa-map-marker-alt text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-primary">Location</h3>
                <p class="text-text-muted">{{ contactInfo.contact_location }}</p>
              </div>
            </div>

            <!-- Phone -->
            <div v-if="contactInfo.contact_phone" class="flex items-start gap-4">
              <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fas fa-phone text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-primary">Phone</h3>
                <a :href="`tel:${contactInfo.contact_phone}`" class="text-text-muted hover:text-primary transition-colors">
                  {{ contactInfo.contact_phone }}
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - Form -->
        <div class="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Name and Email Row -->
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-primary mb-2">Name</label>
                <input
                  v-model="form.name"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-primary mb-2">Email</label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-slate-50 focus:bg-white transition-colors"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <!-- Subject Dropdown -->
            <div>
              <label class="block text-sm font-medium text-primary mb-2">Subject</label>
              <select
                v-model="form.subject"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-slate-50 focus:bg-white transition-colors"
              >
                <option value="general">General Inquiry</option>
                <option value="course">Course Support</option>
                <option value="business">Business Collaboration</option>
                <option value="press">Press / Media</option>
              </select>
            </div>

            <!-- Message Textarea -->
            <div>
              <label class="block text-sm font-medium text-primary mb-2">Message</label>
              <textarea
                v-model="form.message"
                required
                rows="5"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-slate-50 focus:bg-white transition-colors resize-none"
                placeholder="How can I help you?"
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="submitting"
              class="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span v-if="submitting">
                <i class="fas fa-spinner fa-spin"></i> Sending...
              </span>
              <span v-else>
                Send Message
                <i class="fas fa-paper-plane"></i>
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import api from '@/services/api'
import toast from '@/utils/toast'

const route = useRoute()
const router = useRouter()

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
  if (!route.params.username) return
  
  loadingContactInfo.value = true
  try {
    const result = await api.getPublicContactInfo(route.params.username)
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
    const result = await api.submitContactForm(route.params.username, {
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

<style scoped>
/* Additional styles if needed */
</style>
