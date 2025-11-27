<template>
  <section
    id="podcast"
    class="bg-[#1a1c23] rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-900/10 overflow-hidden relative isolate space-y-6"
  >
    <div class="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
    <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />
    <div class="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Headphones class="w-8 h-8 text-white" />
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-300">New Episodes</span>
            <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          </div>
          <h2 class="text-2xl font-bold tracking-tight">WanderLuxe Audio</h2>
          <p class="text-slate-400 text-sm">Travel stories &amp; tips on the go.</p>
        </div>
      </div>
      <button class="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium border border-white/5">
        <Mic class="w-4 h-4" />
        Subscribe
      </button>
    </div>
    <div class="relative z-10 space-y-2">
      <article
        v-for="(episode, index) in PODCAST_EPISODES"
        :key="episode.id"
        class="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
      >
        <div class="text-slate-600 font-mono text-xs w-4">{{ (index + 1).toString().padStart(2, '0') }}</div>
        <div class="relative w-10 h-10 shrink-0 rounded-lg overflow-hidden bg-slate-800">
          <img :src="episode.image" :alt="episode.title" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          <div class="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play class="w-4 h-4 text-white fill-white" />
          </div>
        </div>
        <div class="flex-grow min-w-0">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-slate-200 truncate group-hover:text-white transition-colors">
              {{ episode.title }}
            </h3>
            <Lock v-if="episode.isPremium" class="w-3 h-3 text-amber-400" />
          </div>
          <p class="text-xs text-slate-500 line-clamp-1">
            {{ episode.description }}
          </p>
        </div>
        <div class="flex items-center gap-4 shrink-0">
          <div class="hidden sm:flex items-center gap-1">
            <div class="w-0.5 h-3 bg-indigo-500 rounded-full" />
            <div class="w-0.5 h-5 bg-indigo-500/60 rounded-full" />
            <div class="w-0.5 h-2 bg-indigo-500/40 rounded-full" />
          </div>
          <span class="text-xs font-mono text-slate-400">{{ episode.duration }}</span>
        </div>
      </article>
    </div>
    <div class="mt-8 flex justify-center">
      <button class="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors flex items-center gap-2">
        View Full Library <BarChart3 class="w-3 h-3" />
      </button>
    </div>
  </section>
</template>

<script setup>
import { Play, Lock, Mic, Headphones, BarChart3 } from 'lucide-vue-next'
import { PODCAST_EPISODES } from '../constants'
</script>

