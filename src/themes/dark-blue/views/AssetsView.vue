<template>
  <div>
    <LicensingModal :is-open="showLicense" @close="showLicense = false" />

    <div class="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen bg-surface">
      <div class="flex justify-between items-center mb-8">
        <button
          @click="router.push({ name: 'influencer-home', params: { username: currentUsername } })"
          class="flex items-center gap-2 text-text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft class="w-5 h-5" /> Back to Profile
        </button>
        <button
          @click="showLicense = true"
          class="text-sm font-medium text-secondary hover:text-primary transition-colors flex items-center gap-2"
        >
          <FileText class="w-4 h-4" /> Licensing Terms
        </button>
      </div>

      <SectionHeader
        title="Creator Digital Assets"
        subtitle="Professional grade tools to elevate your content creation game."
        :icon="Download"
      />

      <!-- Filter Tabs -->
      <div class="flex flex-wrap justify-center gap-2 mb-12">
        <button
          v-for="f in filters"
          :key="f"
          @click="filter = f"
          :class="[
            'px-6 py-2 rounded-full text-sm font-bold transition-all',
            filter === f
              ? 'bg-primary text-white shadow-lg shadow-primary/20'
              : 'bg-white text-text-muted hover:bg-slate-100 border border-slate-200'
          ]"
        >
          {{ f }}
        </button>
      </div>

      <div v-if="loading" class="text-center py-12 text-text-muted">
        <div class="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
        <p>Loading assets...</p>
      </div>

      <div v-else-if="error" class="text-center py-12 text-text-muted">
        <p>{{ error }}</p>
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AssetCard
          v-for="asset in filteredAssets"
          :key="asset.id"
          :asset="asset"
          light
          @add-to-cart="$emit('add-to-cart', $event)"
        />
      </div>

      <div v-if="!loading && !error && filteredAssets.length === 0" class="text-center py-20 text-text-muted">
        <Filter class="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p class="text-lg">No assets found in this category.</p>
        <button @click="filter = 'All'" class="text-secondary font-bold mt-2 hover:underline">Clear Filters</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Download, FileText, Filter } from 'lucide-vue-next'
import SectionHeader from '../components/SectionHeader.vue'
import AssetCard from '../components/AssetCard.vue'
import LicensingModal from '../components/LicensingModal.vue'
import api from '@/services/api'

const emit = defineEmits(['add-to-cart'])

const route = useRoute()
const router = useRouter()
const username = inject('influencerUsername', null)
const currentUsername = computed(() => username?.value || route.params.username)

const filter = ref('All')
const filters = ['All', 'LUT', 'RAW Photo', 'Drone Footage', 'Preset']
const showLicense = ref(false)

const assets = ref([])
const loading = ref(false)
const error = ref(null)

const filteredAssets = computed(() => {
  if (filter.value === 'All') return assets.value
  return assets.value.filter((a) => a.type === filter.value)
})

const fetchAssets = async () => {
  if (!currentUsername.value) return
  loading.value = true
  error.value = null
  try {
    const result = await api.getInfluencerMediaAssets(currentUsername.value)
    if (result.success) {
      let data = result.data
      if (data?.data) data = data.data
      assets.value = Array.isArray(data) ? data : data?.data || []
    } else {
      error.value = result.error || 'Failed to load assets.'
    }
  } catch (err) {
    error.value = err.message || 'An unexpected error occurred.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAssets()
})
</script>

