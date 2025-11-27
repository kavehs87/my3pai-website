<template>
  <section id="blog" class="space-y-8">
    <div class="flex items-center justify-between border-b-2 border-slate-100 pb-4">
      <h2 class="text-2xl font-bold text-slate-900">Travel Blog</h2>
      <BookOpen class="w-5 h-5 text-slate-300" />
    </div>
    <div class="space-y-0">
      <article
        v-for="(post, index) in BLOG_POSTS"
        :key="post.id"
        class="group cursor-pointer py-6 border-b border-slate-100 flex flex-col md:flex-row gap-6 items-start hover:bg-white transition-colors relative"
      >
        <div class="w-12 shrink-0 hidden md:block pt-1">
          <span class="text-xs font-mono text-slate-400">0{{ index + 1 }}</span>
        </div>
        <div class="flex-grow">
          <div class="flex items-center gap-3 text-xs font-bold tracking-wider text-slate-400 mb-2 uppercase">
            <span>{{ post.date }}</span>
            <span v-if="post.isPremium" class="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Premium</span>
          </div>
          <h3 class="text-xl md:text-2xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors leading-tight">
            {{ post.title }}
          </h3>
          <p class="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl">
            {{ post.preview }}
          </p>
        </div>
        <div class="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300">
          <div class="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-900">
            <ArrowRight class="w-4 h-4" />
          </div>
        </div>
      </article>
    </div>
    <button class="text-sm font-bold text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-4">
      Read all entries
    </button>
  </section>
</template>

<script setup>
import { ArrowRight, BookOpen } from 'lucide-vue-next'
import { BLOG_POSTS } from '../constants'
</script>

