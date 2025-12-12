<template>
  <Teleport to="body">
    <!-- Cookie Consent Banner -->
    <div
      v-if="showBanner"
      class="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 shadow-2xl"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="max-w-4xl mx-auto">
          <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div class="flex-1">
              <h3 class="text-white font-bold text-lg mb-2">
                Cookie Preferences
              </h3>
              <p class="text-slate-300 text-sm">
                We use cookies to enhance your browsing experience. By clicking "Accept All", you consent to our use of cookies.
              </p>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
              <button
                @click="acceptAll"
                class="px-6 py-3 rounded-lg font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Accept All
              </button>
              <button
                @click="rejectAll"
                class="px-6 py-3 rounded-lg font-semibold text-sm border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Reject All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Teleport } from 'vue'

const showBanner = ref(false)

const checkConsent = () => {
  const consent = localStorage.getItem('cookie_consent_preferences')
  if (!consent) {
    showBanner.value = true
  }
}

const acceptAll = () => {
  localStorage.setItem('cookie_consent_preferences', JSON.stringify({
    strictlyNecessary: true,
    functional: true,
    analytics: true,
    marketing: true,
  }))
  showBanner.value = false
}

const rejectAll = () => {
  localStorage.setItem('cookie_consent_preferences', JSON.stringify({
    strictlyNecessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  }))
  showBanner.value = false
}

onMounted(() => {
  checkConsent()
})
</script>

