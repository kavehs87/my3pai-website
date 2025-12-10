<template>
  <div class="min-h-screen bg-surface pt-28 pb-20">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <!-- Back Button -->
      <button
        @click="router.push({ name: 'influencer-home', params: { username: route.params.username } })"
        class="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft class="w-5 h-5" /> Back
      </button>

      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-primary mb-4">Contact Us</h1>
        <p class="text-text-muted text-lg">
          Have a question or need support? We're here to help.
        </p>
      </div>

      <!-- Contact Information -->
      <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div class="grid md:grid-cols-2 gap-8">
          <!-- General Inquiries -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <i class="fas fa-envelope text-secondary text-xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-primary">General Inquiries</h3>
            </div>
            <p class="text-text-muted mb-2">
              For general questions about My3Pai, our platform, or services:
            </p>
            <a href="mailto:support@my3pai.com" class="text-secondary hover:text-secondary/80 font-medium">
              support@my3pai.com
            </a>
          </div>

          <!-- Creator Support -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <i class="fas fa-user-tie text-secondary text-xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-primary">Creator Support</h3>
            </div>
            <p class="text-text-muted mb-2">
              For creators needing help with their profiles, content, or payments:
            </p>
            <a href="mailto:creators@my3pai.com" class="text-secondary hover:text-secondary/80 font-medium">
              creators@my3pai.com
            </a>
          </div>

          <!-- Technical Support -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <i class="fas fa-tools text-secondary text-xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-primary">Technical Support</h3>
            </div>
            <p class="text-text-muted mb-2">
              Experiencing technical issues? Our team is ready to assist:
            </p>
            <a href="mailto:tech@my3pai.com" class="text-secondary hover:text-secondary/80 font-medium">
              tech@my3pai.com
            </a>
          </div>

          <!-- Business Inquiries -->
          <div>
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                <i class="fas fa-handshake text-secondary text-xl"></i>
              </div>
              <h3 class="text-xl font-semibold text-primary">Business Inquiries</h3>
            </div>
            <p class="text-text-muted mb-2">
              For partnerships, collaborations, or business opportunities:
            </p>
            <a href="mailto:business@my3pai.com" class="text-secondary hover:text-secondary/80 font-medium">
              business@my3pai.com
            </a>
          </div>
        </div>
      </div>

      <!-- Response Time -->
      <div class="bg-secondary/5 rounded-2xl p-6 mb-8">
        <div class="flex items-start gap-4">
          <i class="fas fa-clock text-secondary text-2xl mt-1"></i>
          <div>
            <h3 class="text-lg font-semibold text-primary mb-2">Response Time</h3>
            <p class="text-text-muted">
              We aim to respond to all inquiries within 24-48 hours during business days. 
              For urgent matters, please mark your email as "Urgent" in the subject line.
            </p>
          </div>
        </div>
      </div>

      <!-- FAQ Link -->
      <div class="text-center">
        <p class="text-text-muted mb-4">
          Before contacting us, you might find answers in our frequently asked questions.
        </p>
        <button
          @click="router.push({ name: 'influencer-home', params: { username: route.params.username } })"
          class="px-6 py-3 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
        >
          Return to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
</script>

