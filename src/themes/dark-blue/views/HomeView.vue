<template>
  <div>
    <LicensingModal v-if="showLicense" @close="showLicense = false" />

    <!-- Hero Section -->
    <Hero :profile="profile" :bio-paragraphs="bioParagraphs" @book-click="$emit('book-click')" />

    <!-- Masterclasses -->
    <section id="courses" class="scroll-mt-28 py-20 container mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        title="Masterclasses"
        subtitle="Level up your creative skills with my comprehensive courses."
        :icon="Video"
      />
      <div class="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
        <CourseCard
          v-for="course in displayedCourses"
          :key="course.id"
          :course="course"
          @add-to-cart="handleAddToCart"
        />
      </div>
      <div class="text-center">
        <button
          @click="$emit('view-classes')"
          class="bg-white text-primary border border-slate-200 px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          Browse All Classes
        </button>
      </div>
    </section>

    <!-- Destinations -->
    <section id="maps" class="scroll-mt-28 py-20 bg-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Curated Maps"
          subtitle="Detailed itineraries with hidden spots you won't find on Google."
          :icon="Map"
        />
        <div class="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:pb-0 mb-12">
          <div v-for="dest in displayedMaps" :key="dest.id" class="min-w-[85%] md:min-w-0 snap-center">
            <DestinationCard :dest="dest" @add-to-cart="handleAddToCart" />
          </div>
        </div>
        <div class="text-center">
          <button
            @click="$emit('view-maps')"
            class="bg-white text-primary border border-slate-200 px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            Browse All Maps
          </button>
        </div>
      </div>
    </section>

    <!-- Podcast & Socials -->
    <section id="podcast" class="scroll-mt-28 py-20 container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid lg:grid-cols-2 gap-16">
        <div>
          <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
              <Mic class="w-5 h-5" />
            </div>
            <h2 class="text-2xl font-bold text-primary">Travel Unfiltered Podcast</h2>
          </div>
          <div class="space-y-4 mb-8">
            <PodcastPlayer
              v-for="pod in displayedPodcasts"
              :key="pod.id"
              :podcast="pod"
            />
          </div>
          <div class="text-center md:text-left">
            <button
              @click="$emit('view-podcasts')"
              class="text-secondary font-semibold hover:text-primary transition-colors inline-flex items-center gap-2"
            >
              View All Episodes <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-3 mb-8">
            <div class="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
              <Youtube class="w-5 h-5" />
            </div>
            <h2 class="text-2xl font-bold text-primary">Latest from Socials</h2>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-8">
            <div
              v-if="displayedSocials[0]"
              class="col-span-2 relative aspect-video rounded-xl overflow-hidden group cursor-pointer"
              @click="openSocial(displayedSocials[0])"
            >
              <img
                :src="displayedSocials[0].thumbnail || '/media-placeholder.jpg'"
                class="w-full h-full object-cover"
                alt="Main"
              />
              <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play class="w-12 h-12 text-white fill-white" />
              </div>
              <div class="absolute bottom-2 left-2 text-white text-sm font-medium drop-shadow-md">
                {{ displayedSocials[0].title }}
              </div>
            </div>
            <div
              v-for="social in displayedSocials.slice(1)"
              :key="social.id"
              class="relative aspect-[9/16] rounded-xl overflow-hidden group cursor-pointer"
              @click="openSocial(social)"
            >
              <img
                :src="social.thumbnail || '/media-placeholder.jpg'"
                class="w-full h-full object-cover"
                alt="Short"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                <div class="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-2">
                  <Play class="w-4 h-4 text-white fill-white" />
                </div>
                <p class="text-white text-xs font-medium line-clamp-2">{{ social.title }}</p>
                <p class="text-white/60 text-[10px] mt-1">{{ social.views }} views</p>
              </div>
            </div>
          </div>
          <div class="text-center md:text-left">
            <button
              @click="$emit('view-socials')"
              class="text-secondary font-semibold hover:text-primary transition-colors inline-flex items-center gap-2"
            >
              Browse All Videos <ArrowRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog -->
    <section id="blog" class="scroll-mt-28 py-20 bg-slate-50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Travel Journal" subtitle="Stories, guides, and tips from the road." />
        <div class="grid md:grid-cols-2 gap-10 mb-12">
          <BlogCard
            v-for="post in displayedPosts"
            :key="post.id"
            :post="post"
            @click="$emit('view-post', post)"
          />
        </div>
        <div class="text-center">
          <button
            @click="$emit('view-blog')"
            class="bg-white text-primary border border-slate-200 px-8 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            Browse All Articles
          </button>
        </div>
      </div>
    </section>

    <!-- Assets -->
    <section id="assets" class="scroll-mt-28 py-24 bg-primary text-white">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-end mb-12">
          <div class="max-w-xl">
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Creator Assets</h2>
            <p class="text-slate-300 text-lg">High-quality LUTs, presets, and stock footage to elevate your own content creation.</p>
          </div>
          <div class="hidden md:block">
            <button
              @click="showLicense = true"
              class="text-secondary hover:text-white transition-colors font-medium flex items-center gap-2"
            >
              <FileText class="w-4 h-4" /> View Licensing Terms
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <AssetCard
            v-for="asset in displayedAssets"
            :key="asset.id"
            :asset="asset"
            @add-to-cart="handleAddToCart"
          />
        </div>

        <div class="mt-12 text-center">
          <button
            @click="$emit('view-assets')"
            class="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary transition-all"
          >
            View All Assets
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { Video, Map, Mic, Youtube, ArrowRight, Play, FileText } from 'lucide-vue-next'
import Hero from '../components/Hero.vue'
import SectionHeader from '../components/SectionHeader.vue'
import CourseCard from '../components/CourseCard.vue'
import DestinationCard from '../components/DestinationCard.vue'
import PodcastPlayer from '../components/PodcastPlayer.vue'
import BlogCard from '../components/BlogCard.vue'
import AssetCard from '../components/AssetCard.vue'
import LicensingModal from '../components/LicensingModal.vue'
import api from '@/services/api'
import { MASTERCLASSES, COUNTRIES } from '@/shared/influencer/constants'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  bioParagraphs: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['book-click', 'view-assets', 'view-classes', 'view-maps', 'view-blog', 'view-post', 'view-podcasts', 'view-socials', 'add-to-cart'])

const username = inject('influencerUsername', null)
const currentUsername = computed(() => props.profile?.username || username?.value)

// Data
const courses = ref([])
const maps = ref([])
const blogPosts = ref([])
const podcasts = ref([])
const socialPosts = ref([])
const mediaAssets = ref([])
const loading = ref({
  courses: false,
  maps: false,
  blog: false,
  podcasts: false,
  social: false,
  assets: false,
})
const showLicense = ref(false)

// Display limited items on home page
const displayedCourses = computed(() => courses.value.slice(0, 2))
const displayedAssets = computed(() => mediaAssets.value.slice(0, 4))
const displayedMaps = computed(() => maps.value.slice(0, 3))
const displayedPosts = computed(() => blogPosts.value.slice(0, 2))
const displayedPodcasts = computed(() => podcasts.value.slice(0, 2))
const displayedSocials = computed(() => socialPosts.value.slice(0, 3))

const handleAddToCart = (item) => {
  emit('add-to-cart', item)
}

const openSocial = (social) => {
  if (social.url) {
    window.open(social.url, '_blank', 'noopener,noreferrer')
  }
}

// Fetch data
const fetchCourses = async () => {
  if (!currentUsername.value) return
  loading.value.courses = true
  try {
    const result = await api.getInfluencerMasterclasses(currentUsername.value, { per_page: 2 })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      courses.value = (Array.isArray(data) ? data : data?.data || []).map((c) => ({
        ...c,
        coverImage: c.coverImage || c.image,
      }))
    }
  } catch (err) {
    console.error('Error fetching courses:', err)
  } finally {
    loading.value.courses = false
  }
}

// Helper to get flag emoji from country code
const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

const fetchMaps = async () => {
  // TODO: Fetch maps from API when endpoint is available
  // For now, use mock data from constants
  maps.value = COUNTRIES.map((country) => ({
    id: country.id,
    country: country.name,
    flag: getFlagEmoji(country.flagCode),
    image: country.image,
    description: country.description,
    poiCount: country.pointsOfInterestCount,
    price: country.mapPrice,
  }))
}

const fetchBlogPosts = async () => {
  if (!currentUsername.value) return
  loading.value.blog = true
  try {
    const result = await api.getInfluencerBlogPosts(currentUsername.value, { per_page: 2 })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      blogPosts.value = Array.isArray(data) ? data : data?.data || []
    }
  } catch (err) {
    console.error('Error fetching blog posts:', err)
  } finally {
    loading.value.blog = false
  }
}

const fetchPodcasts = async () => {
  if (!currentUsername.value) return
  loading.value.podcasts = true
  try {
    const result = await api.getInfluencerPodcastEpisodes(currentUsername.value, { per_page: 2 })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      podcasts.value = Array.isArray(data) ? data : data?.data || []
    }
  } catch (err) {
    console.error('Error fetching podcasts:', err)
  } finally {
    loading.value.podcasts = false
  }
}

const fetchSocialPosts = async () => {
  if (!currentUsername.value) return
  loading.value.social = true
  try {
    const result = await api.getInfluencerSocialPostsPublic(currentUsername.value, { per_page: 3 })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      socialPosts.value = Array.isArray(data) ? data : data?.data || []
    }
  } catch (err) {
    console.error('Error fetching social posts:', err)
  } finally {
    loading.value.social = false
  }
}

const fetchMediaAssets = async () => {
  if (!currentUsername.value) return
  loading.value.assets = true
  try {
    const result = await api.getInfluencerMediaAssets(currentUsername.value, { per_page: 4 })
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      mediaAssets.value = Array.isArray(data) ? data : data?.data || []
    }
  } catch (err) {
    console.error('Error fetching media assets:', err)
  } finally {
    loading.value.assets = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchCourses(),
    fetchMaps(),
    fetchBlogPosts(),
    fetchPodcasts(),
    fetchSocialPosts(),
    fetchMediaAssets(),
  ])
})
</script>

