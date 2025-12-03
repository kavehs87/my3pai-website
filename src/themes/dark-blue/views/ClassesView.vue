<template>
  <div class="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-surface">
    <button
      @click="$emit('back')"
      class="flex items-center gap-2 text-text-muted hover:text-primary mb-8 transition-colors"
    >
      <ArrowLeft class="w-5 h-5" /> Back to Profile
    </button>

    <SectionHeader
      title="All Masterclasses"
      subtitle="Comprehensive courses designed to help you master travel content creation."
      :icon="Video"
    />

    <div v-if="loading" class="text-center py-12 text-text-muted">
      <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading courses...</p>
    </div>

    <div v-else-if="error" class="text-center py-12 text-text-muted">
      <p>{{ error }}</p>
    </div>

    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      <CourseCard
        v-for="course in courses"
        :key="course.id"
        :course="course"
        @add-to-cart="$emit('add-to-cart', $event)"
      />
    </div>

    <div v-if="!loading && !error && courses.length === 0" class="text-center py-20 text-text-muted">
      <p class="text-lg">No courses available yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { ArrowLeft, Video } from 'lucide-vue-next'
import SectionHeader from '../components/SectionHeader.vue'
import CourseCard from '../components/CourseCard.vue'
import api from '@/services/api'

defineEmits(['back', 'add-to-cart'])

const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value)

const courses = ref([])
const loading = ref(false)
const error = ref(null)

const fetchCourses = async () => {
  if (!currentUsername.value) return
  loading.value = true
  error.value = null
  try {
    const result = await api.getInfluencerMasterclasses(currentUsername.value)
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      courses.value = (Array.isArray(data) ? data : data?.data || []).map((c) => ({
        ...c,
        coverImage: c.coverImage || c.image,
      }))
    } else {
      error.value = result.error || 'Failed to load courses.'
    }
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCourses()
})
</script>

