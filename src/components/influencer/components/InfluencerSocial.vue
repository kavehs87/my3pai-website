<template>
  <section id="socials" class="space-y-8">
    <div class="flex items-center gap-2">
      <h2 class="text-2xl font-bold text-slate-900">Latest from Socials</h2>
    </div>

    <div>
      <div class="flex items-center gap-2 mb-4">
        <Youtube class="w-5 h-5 text-red-600" />
        <h3 class="font-bold text-lg text-slate-800">Latest on YouTube</h3>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article
          v-for="video in YOUTUBE_VIDEOS"
          :key="video.id"
          class="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all aspect-video"
        >
          <img :src="video.image" :alt="video.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Play class="w-5 h-5 fill-white ml-1" />
            </div>
          </div>
          <div class="absolute bottom-3 right-3 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded">
            {{ video.duration }}
          </div>
          <div class="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <h4 class="text-white font-bold text-sm md:text-base line-clamp-1">{{ video.title }}</h4>
            <span class="text-white/80 text-xs">{{ video.views }} views</span>
          </div>
        </article>
      </div>
    </div>

    <div>
      <div class="flex items-center gap-2 mb-4">
        <Instagram class="w-5 h-5 text-pink-500" />
        <h3 class="font-bold text-lg text-slate-800">Reels &amp; TikToks</h3>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <article
          v-for="post in SHORT_FORM_CONTENT"
          :key="post.id"
          class="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all aspect-[9/16]"
        >
          <img :src="post.image" :alt="post.caption" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md">
            <component :is="getPlatformIcon(post.platform)" class="w-4 h-4" />
          </div>
          <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-12">
            <div class="flex items-center gap-1.5 text-white/90 text-xs font-medium mb-1">
              <Play class="w-3 h-3 fill-white" />
              <span>{{ post.views }}</span>
            </div>
            <p class="text-white font-bold text-xs line-clamp-2">
              {{ post.caption }}
            </p>
          </div>
        </article>
      </div>
    </div>

    <div class="flex justify-center pt-4">
      <button class="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors border-b border-transparent hover:border-slate-300 pb-0.5">
        View all content
      </button>
    </div>
  </section>
</template>

<script setup>
import { Youtube, Instagram, Facebook, Play, Music2 } from 'lucide-vue-next'
import { YOUTUBE_VIDEOS, SHORT_FORM_CONTENT } from '../constants'

const platformIcons = {
  YouTube: Youtube,
  Instagram,
  TikTok: Music2,
  Facebook,
}

const getPlatformIcon = (platform) => platformIcons[platform] || Instagram
</script>

