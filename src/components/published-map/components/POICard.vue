<template>
  <div class="poi-card">
    <!-- Image Section -->
    <div class="poi-image-container">
      <img 
        v-if="mainImage" 
        :src="mainImage" 
        :alt="poi.basic?.name || 'POI Image'"
        class="poi-image"
      />
      <div v-else class="poi-image-placeholder">
        <i class="fas fa-image"></i>
      </div>
      
      <!-- Top-left label -->
      <div v-if="categoryLabel" class="image-label image-label-top-left">
        {{ categoryLabel }}
      </div>
      
      <!-- Top-right photo count -->
      <div v-if="imageCount > 0" class="image-label image-label-top-right">
        <i class="fas fa-camera"></i>
        <span>{{ imageCount }} photo{{ imageCount !== 1 ? 's' : '' }}</span>
      </div>
    </div>
    
    <!-- Content Section -->
    <div class="poi-content">
      <!-- Title and Location -->
      <h3 class="poi-title">{{ poi.basic?.name || 'Untitled Location' }}</h3>
      <p class="poi-tagline">{{ poi.basic?.tagline || '' }}</p>
      
      <div class="poi-location">
        <i class="fas fa-map-marker-alt"></i>
        <span>{{ locationText }}</span>
      </div>
      
      <!-- Key Facts -->
      <div class="poi-key-facts">
        <span v-if="duration" class="fact-pill fact-pill-blue">
          <i class="fas fa-clock"></i>
          <span>{{ duration }}</span>
        </span>
        <span v-if="difficultyText" class="fact-pill fact-pill-yellow">
          <i class="fas fa-mountain"></i>
          <span>{{ difficultyText }}</span>
        </span>
        <span v-if="bestTime" class="fact-pill fact-pill-yellow">
          <i class="fas fa-sun"></i>
          <span>{{ bestTime }}</span>
        </span>
      </div>
      
      <!-- Best In Section -->
      <div v-if="bestInTags.length > 0" class="poi-best-in">
        <span class="best-in-label">Best in:</span>
        <div class="best-in-tags">
          <span 
            v-for="(tag, index) in bestInTags" 
            :key="index"
            class="tag-pill"
            :class="index < 3 ? 'tag-pill-pink' : 'tag-pill-purple'"
          >
            {{ tag }}
          </span>
        </div>
      </div>
      
      <!-- Budget -->
      <div v-if="budgetText" class="poi-budget">
        <span class="fact-pill fact-pill-green">
          <i class="fas fa-dollar-sign"></i>
          <span>{{ budgetText }}</span>
        </span>
      </div>
      
      <!-- Warning -->
      <div v-if="safetyWarning" class="poi-warning">
        <span class="fact-pill fact-pill-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{{ safetyWarning }}</span>
        </span>
      </div>
      
      <!-- What to Expect -->
      <div v-if="whatToExpect.length > 0" class="poi-section">
        <h4 class="section-title">What to expect</h4>
        <ul class="expectation-list">
          <li v-for="(item, index) in whatToExpect" :key="index">{{ item }}</li>
        </ul>
      </div>
      
      <!-- Practical Info -->
      <div v-if="hasPracticalInfo" class="poi-section">
        <h4 class="section-title">Practical info</h4>
        <div class="practical-info">
          <div v-if="distance" class="info-item">
            <i class="fas fa-walking"></i>
            <span>{{ distance }}</span>
          </div>
          <div v-if="elevation" class="info-item">
            <i class="fas fa-mountain"></i>
            <span>{{ elevation }}</span>
          </div>
          <div v-if="hasRestaurant" class="info-item">
            <i class="fas fa-check"></i>
            <span>Restaurant nearby</span>
          </div>
          <div v-if="hasToilets" class="info-item">
            <i class="fas fa-check"></i>
            <span>Toilets available</span>
          </div>
        </div>
      </div>
      
      <!-- Action Buttons -->
      <div class="poi-actions">
        <button class="btn-primary" @click="viewDetails">
          View full details
        </button>
        <div class="action-icons">
          <button class="icon-btn" @click="showOnMap" title="Show on map">
            <i class="fas fa-map-marker-alt"></i>
          </button>
          <button class="icon-btn" @click="addToMap" title="Add to map">
            <i class="fas fa-plus"></i>
          </button>
          <button class="icon-btn" @click="toggleFavorite" :class="{ active: isFavorite }" title="Save">
            <i class="fas fa-heart"></i>
          </button>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="poi-footer">
        <i class="fas fa-map-pin footer-icon"></i>
        <span>Included in {{ mapsCount }} digital map{{ mapsCount !== 1 ? 's' : '' }} by this creator</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'POICard',
  props: {
    poi: {
      type: Object,
      required: true
    },
    mapsCount: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      isFavorite: false
    }
  },
  computed: {
    mainImage() {
      if (this.poi.media?.images && this.poi.media.images.length > 0) {
        return this.poi.media.images[0].url
      }
      if (this.poi.media?.previewImage) {
        return this.poi.media.previewImage
      }
      return null
    },
    imageCount() {
      return this.poi.media?.images?.length || 0
    },
    categoryLabel() {
      const placeType = this.poi.category?.placeType
      if (!placeType) return null
      
      const labels = {
        nature: 'Nature',
        city: 'City',
        culture: 'Culture',
        food: 'Food',
        adventure: 'Adventure',
        other: 'Other'
      }
      return labels[placeType] || null
    },
    locationText() {
      const parts = []
      if (this.poi.basic?.landmark) {
        parts.push(`Near ${this.poi.basic.landmark}`)
      }
      if (this.poi.basic?.region) {
        parts.push(this.poi.basic.region)
      }
      if (this.poi.basic?.country) {
        // Could convert ISO code to country name, but for now just use code
        parts.push(this.poi.basic.country)
      }
      return parts.length > 0 ? parts.join(', ') : 'Location not specified'
    },
    duration() {
      return this.poi.basic?.estimatedDuration || null
    },
    difficultyText() {
      const difficulty = this.poi.difficulty?.difficulty
      if (!difficulty) return null
      
      const labels = {
        'very-easy': 'Very Easy',
        'easy': 'Easy',
        'moderate': 'Moderate',
        'challenging': 'Challenging',
        'hard': 'Hard',
        'extreme': 'Extreme'
      }
      return labels[difficulty] || difficulty
    },
    bestTime() {
      // Could be derived from tips or other data
      // For now, return null or a default
      return null
    },
    bestInTags() {
      const tags = []
      
      // Add audience tags
      if (this.poi.category?.audience) {
        this.poi.category.audience.forEach(audience => {
          tags.push(this.formatTag(audience))
        })
      }
      
      // Add activity tags (limited)
      if (this.poi.category?.activities && tags.length < 5) {
        this.poi.category.activities.slice(0, 5 - tags.length).forEach(activity => {
          tags.push(this.formatTag(activity))
        })
      }
      
      // Add region tags
      if (this.poi.regions?.tags && tags.length < 5) {
        this.poi.regions.tags.slice(0, 5 - tags.length).forEach(tag => {
          tags.push(this.formatTag(tag))
        })
      }
      
      return tags.slice(0, 6) // Limit to 6 tags
    },
    budgetText() {
      if (!this.poi.pricing) return null
      
      const { costType, estimatedMinPrice, estimatedMaxPrice, currency } = this.poi.pricing
      
      if (costType === 'free') {
        return 'Free'
      }
      
      if (estimatedMinPrice && estimatedMaxPrice) {
        const curr = currency || 'CHF'
        return `Budget about ${estimatedMinPrice}-${estimatedMaxPrice} ${curr} per person`
      }
      
      if (estimatedMinPrice) {
        const curr = currency || 'CHF'
        return `From ${estimatedMinPrice} ${curr} per person`
      }
      
      return costType === 'paid' ? 'Paid' : null
    },
    safetyWarning() {
      return this.poi.tips?.safetyNotes || null
    },
    whatToExpect() {
      const items = []
      
      // Use summary if available
      if (this.poi.basic?.summary) {
        // Split summary into bullet points if it contains newlines or is long
        const summary = this.poi.basic.summary
        if (summary.includes('\n')) {
          return summary.split('\n').filter(line => line.trim())
        }
        // If summary is long, try to split by sentences
        if (summary.length > 100) {
          return summary.split(/[.!?]+/).filter(s => s.trim()).slice(0, 3)
        }
        return [summary]
      }
      
      // Fallback to experience
      if (this.poi.experience?.experience) {
        const exp = this.poi.experience.experience
        if (exp.includes('\n')) {
          return exp.split('\n').filter(line => line.trim()).slice(0, 3)
        }
        return [exp].slice(0, 3)
      }
      
      return items
    },
    distance() {
      return this.poi.difficulty?.distance || null
    },
    elevation() {
      return this.poi.difficulty?.elevationGain || null
    },
    hasRestaurant() {
      return this.poi.amenities?.amenities?.some(a => 
        a.toLowerCase().includes('restaurant') || 
        a.toLowerCase().includes('dining') ||
        a.toLowerCase().includes('food')
      ) || this.poi.amenities?.nearbyServices?.toLowerCase().includes('restaurant')
    },
    hasToilets() {
      return this.poi.amenities?.amenities?.some(a => 
        a.toLowerCase().includes('toilet') || 
        a.toLowerCase().includes('restroom') ||
        a.toLowerCase().includes('wc')
      )
    },
    hasPracticalInfo() {
      return !!(this.distance || this.elevation || this.hasRestaurant || this.hasToilets)
    }
  },
  methods: {
    formatTag(tag) {
      // Convert snake_case or kebab-case to Title Case
      return tag
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    },
    viewDetails() {
      this.$emit('view-details', this.poi)
    },
    showOnMap() {
      this.$emit('show-on-map', this.poi)
    },
    addToMap() {
      this.$emit('add-to-map', this.poi)
    },
    toggleFavorite() {
      this.isFavorite = !this.isFavorite
      this.$emit('toggle-favorite', this.poi, this.isFavorite)
    }
  }
}
</script>

<style scoped>
.poi-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-light);
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.poi-card:hover {
  box-shadow: 0 4px 16px var(--shadow-medium);
  transform: translateY(-2px);
}

/* Image Section */
.poi-image-container {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.poi-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poi-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-muted);
}

.poi-image-placeholder i {
  font-size: 3rem;
  opacity: 0.5;
}

.image-label {
  position: absolute;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  z-index: 10;
}

.image-label-top-left {
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  background: rgba(255, 255, 255, 0.95);
  color: var(--text-primary);
}

.image-label-top-right {
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.7);
  color: white;
}

.image-label i {
  font-size: var(--font-size-xs);
}

/* Content Section */
.poi-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex: 1;
}

.poi-title {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.poi-tagline {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.poi-location {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.poi-location i {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
}

/* Key Facts */
.poi-key-facts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.fact-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  white-space: nowrap;
}

.fact-pill i {
  font-size: var(--font-size-xs);
}

.fact-pill-blue {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.fact-pill-yellow {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.fact-pill-green {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.fact-pill-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

/* Best In Section */
.poi-best-in {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.best-in-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.best-in-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.tag-pill {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 500;
  white-space: nowrap;
}

.tag-pill-pink {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.tag-pill-purple {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

/* Sections */
.poi-section {
  margin-top: var(--spacing-xs);
}

.section-title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.expectation-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.expectation-list li {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  padding-left: var(--spacing-md);
  position: relative;
}

.expectation-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

.practical-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.info-item i {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  width: 16px;
}

/* Actions */
.poi-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-sm);
}

.btn-primary {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 52, 78, 0.3);
}

.action-icons {
  display: flex;
  gap: var(--spacing-xs);
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-light);
  background: var(--bg-primary);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.icon-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--border-medium);
  color: var(--text-primary);
}

.icon-btn.active {
  background: var(--error-color);
  border-color: var(--error-color);
  color: white;
}

.icon-btn i {
  font-size: var(--font-size-sm);
}

/* Footer */
.poi-footer {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin-top: auto;
  padding-top: var(--spacing-sm);
  border-top: 1px solid var(--border-light);
}

.footer-icon {
  color: var(--error-color);
  font-size: var(--font-size-xs);
}

@media (max-width: 768px) {
  .poi-image-container {
    height: 250px;
  }
  
  .poi-content {
    padding: var(--spacing-md);
  }
  
  .poi-title {
    font-size: var(--font-size-xl);
  }
  
  .poi-actions {
    flex-direction: column;
  }
  
  .btn-primary {
    width: 100%;
  }
}
</style>

