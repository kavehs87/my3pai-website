<template>
  <div class="video-shorts">
    <div class="container">
      <div class="section-header">
        <h2>Creator Plans</h2>
        <p>Discover amazing travel itineraries from our community creators</p>
      </div>

      <div v-if="loading" class="loading">Loading creator trips...</div>
      <div v-else>
        <div v-if="error" class="error">{{ error }}</div>

        <div class="shorts-container" v-if="plans.length">
          <div class="shorts-scroll">
            <div 
              v-for="plan in plans" 
              :key="plan.id" 
              class="short-card"
              :data-plan-id="plan.id"
              @click="selectPlan(plan)"
              ref="shortCards"
            >
              <div class="video-container">
                <div class="video-thumbnail" :class="{ 'playing': playingVideo === plan.id }">
                  <img :src="plan.thumbnail" :alt="plan.title" />
                  <div class="video-overlay" v-if="playingVideo !== plan.id">
                    <div class="platform-badge" :class="plan.platform">
                      <i :class="getPlatformIcon(plan.platform)"></i>
                    </div>
                    <div class="video-duration" v-if="plan.durationSeconds !== null">
                      {{ formatDuration(plan.durationSeconds) }}
                    </div>
                    <div class="play-button" @click.stop="playVideo(plan.id)">
                      <i class="fas fa-play"></i>
                    </div>
                  </div>
                  <div class="video-controls" v-if="playingVideo === plan.id">
                    <button class="pause-btn" @click.stop="pauseVideo">
                      <i class="fas fa-pause"></i>
                    </button>
                  </div>
                </div>
              </div>

              <div class="short-content">
                <div class="creator-section">
                  <img :src="plan.creator.avatar" :alt="plan.creator.name" class="creator-avatar" />
                  <div class="creator-info">
                    <router-link :to="{ name: 'creator-profile', params: { id: plan.creator.id } }" class="creator-name">
                      {{ plan.creator.name }}
                    </router-link>
                    <span class="creator-followers">{{ formatFollowers(plan.creator.followers) }}</span>
                  </div>
                  <button class="clone-btn" @click.stop="clonePlan(plan)">
                    <i class="fas fa-copy"></i>
                  </button>
                </div>

                <div class="video-info">
                  <h3 class="video-title">{{ plan.title }}</h3>
                  <p class="video-description">{{ plan.description }}</p>
                </div>

                <div class="engagement-stats">
                  <div class="stat-item">
                    <i class="fas fa-eye"></i>
                    <span>{{ formatNumber(plan.views) }}</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-heart"></i>
                    <span>{{ formatNumber(plan.likes) }}</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-comment"></i>
                    <span>{{ formatNumber(plan.comments) }}</span>
                  </div>
                </div>

                <div class="plan-details">
                  <div class="detail-item">
                    <span class="difficulty" :class="plan.difficulty">{{ plan.difficulty }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="budget">{{ plan.budget }}</span>
                  </div>
                </div>

                <div class="video-tags">
                  <span 
                    v-for="tag in plan.tags.slice(0, 2)" 
                    :key="tag" 
                    class="tag"
                  >
                    #{{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>No discovery trips available right now.</p>
          <router-link class="btn" :to="{ name: 'trip-new' }">
            <i class="fas fa-plus"></i>
            Create Trip
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api.js'

const PLACEHOLDER_THUMB = 'https://via.placeholder.com/300x500?text=Trip+Preview'
const PLACEHOLDER_AVATAR = 'https://via.placeholder.com/80?text=Traveler'

export default {
  name: 'TripShorts',
  data() {
    return {
      plans: [],
      playingVideo: null,
      observer: null,
      loading: false,
      error: ''
    }
  },
  async mounted() {
    await this.loadTrips()
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect()
    }
  },
  methods: {
    async loadTrips() {
      this.loading = true
      this.error = ''
      try {
        const res = await apiService.getDiscoverTrips({ perPage: 12 })
        if (!res.success) {
          throw new Error(res.error || 'Failed to load trips')
        }
        const trips = this.extractTripsArray(res.data)
        this.plans = trips.map(trip => this.transformTrip(trip))
        await this.$nextTick()
        if (!this.plans.length) {
          console.warn('[TripShorts] No trips returned from API response:', res)
        }
        this.setupIntersectionObserver()
      } catch (e) {
        this.error = e.message || 'Failed to load trips'
        this.plans = []
      } finally {
        this.loading = false
      }
    },
    extractTripsArray(payload) {
      if (!payload) return []
      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload.trips)) return payload.trips
      if (Array.isArray(payload.data)) return payload.data
      if (Array.isArray(payload.data?.trips)) return payload.data.trips
      return []
    },
    transformTrip(trip) {
      const tagsArray = Array.isArray(trip.tags)
        ? trip.tags.filter(Boolean)
        : []

      const platform = (trip.platform || trip.status || 'trip').toString().toLowerCase()
      const difficulty = (trip.difficulty || 'medium').toString().toLowerCase()
      const budgetLabel = trip.status || 'Planning'
      const shortThumb = trip.shortThumbnail || trip.short_thumbnail || trip.thumbnail || PLACEHOLDER_THUMB
      const duration = trip.shortDuration ?? trip.short_duration ?? null
      const views = trip.views ?? 0
      const likes = trip.likes ?? 0
      const comments = trip.comments ?? 0
      const owner = trip.owner || trip.user || {}
      const followers = owner.followers ?? owner.followers_count ?? null

      return {
        id: trip.id || Math.random().toString(36).slice(2),
        title: trip.title || 'Untitled Trip',
        description: trip.destination || 'No description available yet.',
        thumbnail: shortThumb,
        platform,
        durationSeconds: typeof duration === 'number' ? duration : null,
        views,
        likes,
        comments,
        difficulty,
        budget: budgetLabel,
        tags: tagsArray.length ? tagsArray : [trip.destination || 'trip'],
        creator: {
          id: owner.id || 'me',
          name: owner.name || 'My3PAI Traveler',
          avatar: owner.avatar || PLACEHOLDER_AVATAR,
          followers
        }
      }
    },
    getPlatformIcon(platform) {
      const icons = {
        youtube: 'fab fa-youtube',
        instagram: 'fab fa-instagram',
        tiktok: 'fab fa-tiktok',
        planning: 'fas fa-route',
        upcoming: 'fas fa-calendar-check',
        completed: 'fas fa-flag-checkered',
        cancelled: 'fas fa-ban',
        trip: 'fas fa-map'
      }
      return icons[platform] || 'fas fa-map'
    },
    formatNumber(value) {
      if (value === null || value === undefined || value === '' || value === '—') {
        return '—'
      }
      const str = value.toString()
      if (/[MK]$/i.test(str)) return str
      const numeric = parseInt(str.replace(/[^\d]/g, ''), 10)
      if (Number.isNaN(numeric)) return str
      if (numeric >= 1_000_000) return (numeric / 1_000_000).toFixed(1) + 'M'
      if (numeric >= 1_000) return (numeric / 1_000).toFixed(1) + 'K'
      return numeric.toString()
    },
    formatFollowers(count) {
      if (count === null || count === undefined) return 'Followers unavailable'
      return `${this.formatNumber(count)} followers`
    },
    formatDuration(seconds) {
      if (typeof seconds !== 'number' || Number.isNaN(seconds)) return ''
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    playVideo(planId) {
      this.playingVideo = planId
      console.log('Playing video:', planId)
    },
    pauseVideo() {
      this.playingVideo = null
      console.log('Paused video')
    },
    setupIntersectionObserver() {
      if (this.observer) {
        this.observer.disconnect()
        this.observer = null
      }
      if (!this.$refs.shortCards || !this.$refs.shortCards.length) return

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const planId = entry.target.dataset.planId
            if (planId && this.playingVideo !== planId) {
              this.playVideo(planId)
            }
          }
        })
      }, {
        threshold: 0.5
      })

      this.$refs.shortCards?.forEach(card => {
        this.observer.observe(card)
      })
    },
    selectPlan(plan) {
      console.log('Selected plan:', plan)
    },
    clonePlan(plan) {
      console.log('Cloning plan:', plan)
    }
  }
}
</script>

<style scoped>
.video-shorts {
  padding: var(--spacing-3xl) 0;
  background: var(--bg-dark-grey);
  color: var(--bg-primary);
}

.loading,
.error,
.empty-state {
  text-align: center;
  margin-top: var(--spacing-lg);
}

.error {
  color: var(--danger-color);
}

.empty-state {
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
}

.btn {
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  font-weight: 600;
}

.shorts-container {
  max-width: 100%;
  overflow-x: auto;
  padding: var(--spacing-lg) 0;
}

.shorts-scroll {
  display: flex;
  gap: var(--spacing-lg);
  padding: 0 var(--spacing-lg);
  min-width: max-content;
}

.short-card {
  width: 300px;
  height: 500px;
  background: var(--bg-dark);
  border-radius: var(--radius-xl);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform var(--transition-normal);
}

.short-card:hover {
  transform: scale(1.02);
}

.video-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.video-thumbnail {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.video-thumbnail.playing img {
  transform: scale(1.05);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4));
  display: flex;
  align-items: center;
  justify-content: center;
}

.platform-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  font-size: var(--font-size-xs);
  text-transform: capitalize;
}

.platform-badge.youtube {
  background: #ff0000;
}

.platform-badge.instagram {
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
}

.platform-badge.tiktok {
  background: #000000;
}

.platform-badge.planning {
  background: var(--secondary-color);
}

.platform-badge.upcoming {
  background: var(--primary-color);
}

.platform-badge.completed {
  background: #10b981;
}

.platform-badge.cancelled {
  background: #ef4444;
}

.platform-badge.trip {
  background: var(--secondary-color);
}

.video-duration {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.play-button {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.play-button:hover {
  background: var(--bg-primary);
  transform: scale(1.1);
}

.video-controls {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
}

.pause-btn {
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: var(--radius-full);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  cursor: pointer;
  transition: background var(--transition-normal);
}

.pause-btn:hover {
  background: rgba(0, 0, 0, 0.9);
}

.short-content {
  padding: var(--spacing-lg);
  height: calc(100% - 200px);
  display: flex;
  flex-direction: column;
}

.creator-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.creator-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--bg-primary);
  margin: 0 0 4px 0;
  text-decoration: none;
  transition: color var(--transition-normal);
  display: block;
}

.creator-name:hover {
  color: var(--secondary-color);
}

.creator-followers {
  font-size: var(--font-size-xs);
  color: #a1a1aa;
  margin: 0;
}

.clone-btn {
  background: var(--secondary-color);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-full);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-normal);
  font-size: var(--font-size-xs);
}

.clone-btn:hover {
  background: var(--primary-hover);
}

.video-info {
  margin-bottom: var(--spacing-md);
}

.video-title {
  font-size: var(--font-size-base);
  font-weight: 700;
  color: var(--bg-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-description {
  font-size: var(--font-size-xs);
  color: #a1a1aa;
  line-height: 1.4;
  margin: 0;
  line-clamp: 2;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.engagement-stats {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.stat-item i {
  font-size: var(--font-size-xs);
  color: var(--secondary-color);
}

.plan-details {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.detail-item {
  font-size: var(--font-size-xs);
}

.difficulty {
  text-transform: capitalize;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.budget {
  color: #a1a1aa;
}

.video-tags {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
  margin-top: auto;
}

.tag {
  background: #2a2a2a;
  color: #a1a1aa;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .shorts-scroll {
    padding: 0 var(--spacing-sm);
    gap: var(--spacing-md);
  }

  .short-card {
    width: 280px;
    height: 480px;
  }
}

@media (max-width: 480px) {
  .video-shorts {
    padding: var(--spacing-2xl) 0;
  }

  .shorts-scroll {
    gap: var(--spacing-sm);
  }

  .short-card {
    width: 260px;
    height: 460px;
  }

  .short-content {
    padding: var(--spacing-md);
  }
}

/* Hide scrollbar */
.shorts-container::-webkit-scrollbar {
  display: none;
}

.shorts-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

