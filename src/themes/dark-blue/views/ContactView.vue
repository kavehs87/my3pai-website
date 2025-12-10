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
          <p class="text-lg text-text-muted mb-8 leading-relaxed">
            Have a question about a course, need a custom itinerary, or want to collaborate? Fill out the form or reach out directly via email.
          </p>

          <div class="space-y-6 mb-12">
            <!-- Email Contact -->
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fas fa-envelope text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-primary">Email</h3>
                <p class="text-text-muted">hello@alexwalker.com</p>
              </div>
            </div>

            <!-- Location -->
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <i class="fas fa-map-marker-alt text-xl"></i>
              </div>
              <div>
                <h3 class="font-bold text-primary">Location</h3>
                <p class="text-text-muted">Bali, Indonesia</p>
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
              class="w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              Send Message
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const submitted = ref(false)

const form = ref({
  name: '',
  email: '',
  subject: 'general',
  message: ''
})

const handleSubmit = () => {
  // TODO: Implement actual form submission to backend
  console.log('Form submitted:', form.value)
  submitted.value = true
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
