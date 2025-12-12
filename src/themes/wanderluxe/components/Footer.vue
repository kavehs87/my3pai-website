<template>
  <footer class="bg-white border-t border-slate-200 py-12 mt-12">
    <div class="max-w-7xl mx-auto px-6 text-center">
      <div class="flex justify-center gap-8 mb-8 text-sm font-medium text-slate-500">
        <router-link
          :to="{ name: 'influencer-contact', params: { username: currentUsername } }"
          class="hover:text-slate-900 transition-colors"
        >
          Contact
        </router-link>
        <router-link
          :to="{ name: 'influencer-terms', params: { username: currentUsername } }"
          class="hover:text-slate-900 transition-colors"
        >
          Terms of Service
        </router-link>
        <router-link
          :to="{ name: 'influencer-privacy', params: { username: currentUsername } }"
          class="hover:text-slate-900 transition-colors"
        >
          Privacy Policy
        </router-link>
      </div>
      <p class="text-slate-400 text-sm">© 2024 my3p.ai</p>
    </div>
  </footer>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const currentUsername = route.params.username
</script>

