<template>
  <Teleport to="body">
    <!-- Cookie Consent Banner -->
    <transition name="slide-up">
      <div
        v-if="showBanner"
        class="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-secondary/20 shadow-2xl"
      >
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="max-w-4xl mx-auto">
            <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div class="flex-1 pr-2 pt-2 pb-2">
                <h3 class="text-white font-bold text-lg mb-2 px-1">
                  <i class="fas fa-cookie-bite text-secondary mr-2"></i>
                  Cookie Preferences
                </h3>
                <p class="text-slate-200 text-sm leading-relaxed px-1">
                  We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                  By clicking "Accept All", you consent to our use of cookies. You can customize your preferences below.
                </p>
              </div>
              <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  @click="openPreferences"
                  class="px-6 py-3 rounded-lg font-semibold text-sm transition-colors border border-slate-300 text-slate-200 hover:bg-white/10 hover:border-slate-200"
                >
                  Customize
                </button>
                <button
                  @click="rejectAll"
                  class="px-6 py-3 rounded-lg font-semibold text-sm transition-colors border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-slate-800/50"
                >
                  Reject All
                </button>
                <button
                  @click="acceptAll"
                  class="px-6 py-3 rounded-lg font-semibold text-sm transition-colors bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/30"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Cookie Preferences Modal -->
    <transition name="fade">
      <div
        v-if="showPreferences"
        class="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        @click.self="closePreferences"
      >
        <div class="bg-primary rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Modal Header -->
          <div class="px-6 py-5 border-b border-secondary/20">
            <div class="flex items-center justify-between">
              <h2 class="text-white font-bold text-xl">
                <i class="fas fa-cog text-secondary mr-2"></i>
                Cookie Preferences
              </h2>
              <button
                @click="closePreferences"
                class="text-slate-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            </div>
            <p class="text-slate-300 text-sm mt-2">
              Manage your cookie preferences. You can enable or disable different types of cookies below.
            </p>
          </div>

          <!-- Modal Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5">
            <div class="space-y-4">
              <!-- Strictly Necessary -->
              <div class="bg-slate-800/50 rounded-xl p-5 border border-secondary/20">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                      <h3 class="text-white font-semibold text-base">Strictly Necessary</h3>
                      <span class="px-2 py-1 bg-secondary/20 text-secondary text-xs font-semibold rounded">
                        Always Active
                      </span>
                    </div>
                    <p class="text-slate-300 text-sm leading-relaxed">
                      These cookies are essential for the website to function properly. They include shopping cart functionality and login session management. These cannot be disabled.
                    </p>
                  </div>
                  <div class="ml-4 flex items-center">
                    <div class="relative">
                      <input
                        type="checkbox"
                        checked
                        disabled
                        class="w-12 h-6 rounded-full bg-secondary appearance-none cursor-not-allowed opacity-60"
                      />
                      <div class="absolute top-0 left-0 w-6 h-6 bg-white rounded-full transform translate-x-6 transition-transform pointer-events-none"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Functional -->
              <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="text-white font-semibold text-base mb-2">Functional</h3>
                    <p class="text-slate-300 text-sm leading-relaxed">
                      These cookies allow the website to remember choices you make (such as your username, language, or region) and provide enhanced, personalized features. For example, we use these cookies to save your podcast listening history and preferences.
                    </p>
                  </div>
                  <div class="ml-4 flex items-center">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="preferences.functional"
                        class="sr-only peer"
                      />
                      <div class="w-12 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Analytics -->
              <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="text-white font-semibold text-base mb-2">Analytics</h3>
                    <p class="text-slate-300 text-sm leading-relaxed">
                      These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website and services.
                    </p>
                  </div>
                  <div class="ml-4 flex items-center">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="preferences.analytics"
                        class="sr-only peer"
                      />
                      <div class="w-12 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Marketing -->
              <div class="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1">
                    <h3 class="text-white font-semibold text-base mb-2">Marketing</h3>
                    <p class="text-slate-300 text-sm leading-relaxed">
                      These cookies are used to deliver advertisements that are more relevant to you and your interests. They may also be used to limit the number of times you see an advertisement and measure the effectiveness of advertising campaigns.
                    </p>
                  </div>
                  <div class="ml-4 flex items-center">
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        v-model="preferences.marketing"
                        class="sr-only peer"
                      />
                      <div class="w-12 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-secondary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-5 border-t border-secondary/20 flex flex-col sm:flex-row gap-3 justify-end">
            <button
              @click="closePreferences"
              class="px-6 py-3 rounded-lg font-semibold text-sm transition-colors border border-slate-300 text-slate-200 hover:bg-white/10 hover:border-slate-200"
            >
              Cancel
            </button>
            <button
              @click="savePreferences"
              class="px-6 py-3 rounded-lg font-semibold text-sm transition-colors bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/30"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import eventBus from '@/utils/eventBus'

const STORAGE_KEY = 'cookie_consent_preferences'

// State
const showBanner = ref(false)
const showPreferences = ref(false)
const preferences = ref({
  necessary: true, // Always true, cannot be changed
  functional: false,
  analytics: false,
  marketing: false
})

// Check if consent already exists
const checkExistingConsent = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      preferences.value = { ...parsed }
      // Ensure necessary is always true
      preferences.value.necessary = true
      showBanner.value = false
      updateScripts(preferences.value)
      return true
    }
  } catch (error) {
    console.error('Error reading cookie consent:', error)
  }
  return false
}

// Save preferences to localStorage
const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences.value))
    eventBus.emit('consent-updated', preferences.value)
    updateScripts(preferences.value)
  } catch (error) {
    console.error('Error saving cookie consent:', error)
  }
}

// Accept all cookies
const acceptAll = () => {
  preferences.value = {
    necessary: true,
    functional: true,
    analytics: true,
    marketing: true
  }
  saveToStorage()
  showBanner.value = false
  showPreferences.value = false
}

// Reject all cookies (only necessary remains)
const rejectAll = () => {
  preferences.value = {
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  }
  saveToStorage()
  showBanner.value = false
  showPreferences.value = false
}

// Open preferences modal
const openPreferences = () => {
  showPreferences.value = true
}

// Close preferences modal
const closePreferences = () => {
  showPreferences.value = false
}

// Save custom preferences
const savePreferences = () => {
  saveToStorage()
  showBanner.value = false
  showPreferences.value = false
}

// Update scripts based on preferences
// This is a placeholder where you can add your Google Analytics, Pixel, etc.
const updateScripts = (prefs) => {
  // TODO: Add your script initialization logic here
  // Example:
  // if (prefs.analytics) {
  //   // Initialize Google Analytics
  // }
  // if (prefs.marketing) {
  //   // Initialize Facebook Pixel
  // }
  // if (prefs.functional) {
  //   // Initialize functional cookies
  // }
  console.log('Cookie preferences updated:', prefs)
}

// Initialize on mount
onMounted(() => {
  const hasConsent = checkExistingConsent()
  if (!hasConsent) {
    showBanner.value = true
  }
})

// Watch for preference changes in modal to prevent necessary from being disabled
watch(() => preferences.value.necessary, (newVal) => {
  if (!newVal) {
    preferences.value.necessary = true
  }
})
</script>

<style scoped>
/* Slide up animation for banner */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Fade animation for modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(72, 196, 200, 0.3);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(72, 196, 200, 0.5);
}
</style>

