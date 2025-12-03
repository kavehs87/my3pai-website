<template>
  <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div class="relative w-16 h-16 flex-shrink-0">
      <img
        :src="podcast.image || podcast.coverImage"
        alt="Podcast thumbnail"
        class="w-full h-full object-cover rounded-xl"
      />
      <button
        @click="isPlaying = !isPlaying"
        class="absolute inset-0 bg-black/30 flex items-center justify-center rounded-xl hover:bg-black/40 transition-colors"
      >
        <Pause v-if="isPlaying" class="w-6 h-6 text-white" />
        <Play v-else class="w-6 h-6 text-white" />
      </button>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <Lock v-if="podcast.isPremium" class="w-3 h-3 text-yellow-500" />
        <span class="text-xs text-secondary font-semibold">{{ podcast.duration }}</span>
        <span class="text-xs text-text-light">• {{ podcast.date }}</span>
      </div>
      <h4 class="font-bold text-primary truncate pr-2">{{ podcast.title }}</h4>

      <!-- Waveform -->
      <div class="flex items-center gap-0.5 mt-2 h-3">
        <div
          v-for="i in 20"
          :key="i"
          :class="[
            'w-1 bg-secondary/40 rounded-full',
            isPlaying ? 'animate-wave' : ''
          ]"
          :style="{
            height: `${waveformHeights[i - 1]}%`,
            animationDelay: `${(i - 1) * 0.05}s`,
            animationPlayState: isPlaying ? 'running' : 'paused'
          }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Play, Pause, Lock } from 'lucide-vue-next'

const props = defineProps({
  podcast: {
    type: Object,
    required: true,
  },
})

const isPlaying = ref(false)

// Generate random waveform heights (same pattern each render)
const waveformHeights = ref([])
onMounted(() => {
  waveformHeights.value = Array.from({ length: 20 }, () => Math.random() * 100)
})
</script>

