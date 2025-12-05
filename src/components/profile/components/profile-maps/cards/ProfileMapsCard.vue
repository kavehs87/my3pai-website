<template>
  <article class="map-card">
      <div class="card-media" :class="{ 'has-thumbnail': hasThumbnail }" :style="coverStyle">
      <div class="status-badge" :class="statusClass">
        <i :class="statusIcon"></i>
        <span>{{ statusLabel }}</span>
      </div>
      <div v-if="map.isForSale && map.price" class="price-badge">
        <span>{{ formattedPrice }}</span>
      </div>
      
      <div v-if="!hasThumbnail" class="media-placeholder">
        <div class="placeholder-content">
          <i class="fas fa-map"></i>
          <span class="initials">{{ initials }}</span>
        </div>
      </div>
      
      <div class="media-overlay">
        <span v-if="map.slug" class="slug-badge">
          <i class="fas fa-link"></i>
          /{{ map.slug }}
        </span>
      </div>
    </div>

    <div class="card-content">
      <header class="card-header">
        <div class="header-top">
        <p class="eyebrow">{{ subtitle }}</p>
          <a 
            v-if="map.isPublished && map.slug && username" 
            :href="`/u/${username}/${map.slug}`"
            class="view-as-link"
            @click.prevent="handlePreview"
            title="View as public"
          >
            Preview
          </a>
        </div>
        <h3 class="title" :title="map.title">{{ map.title }}</h3>
      </header>

      <p class="summary" :title="map.summary">
        {{ map.summary || 'No summary provided.' }}
      </p>

      <footer class="card-footer">
        <div class="meta-row">
          <div class="meta-item" :title="poiTitle">
            <i :class="poiIconClass"></i>
            <span>{{ poiLabel }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item" title="Last updated">
            <i class="far fa-clock"></i>
            <span>{{ formattedUpdated }}</span>
          </div>
          <template v-if="hasIndicators">
            <div class="meta-divider"></div>
            <div class="meta-item" v-if="map.hasAudio" title="Has audio recordings">
              <i class="fas fa-microphone"></i>
              <span>Audio</span>
            </div>
            <div class="meta-divider" v-if="map.hasAudio && map.poisWithImages > 0"></div>
            <div class="meta-item" v-if="map.poisWithImages > 0" :title="`${map.poisWithImages} POI${map.poisWithImages > 1 ? 's' : ''} with images`">
              <i class="fas fa-images"></i>
              <span>{{ map.poisWithImages }}</span>
            </div>
          </template>
        </div>
        
        <div class="location-row" v-if="map.locationLabel">
            <i class="fas fa-globe-americas"></i>
          <span class="location-text">{{ map.locationLabel }}</span>
        </div>
        
        <!-- Pricing Info Row -->
        <div v-if="map.isForSale" class="pricing-row">
          <div class="pricing-info">
            <i class="fas fa-tag"></i>
            <span class="pricing-label">For Sale</span>
            <span v-if="map.price" class="pricing-value">{{ formattedPrice }}</span>
          </div>
        </div>
        
        <!-- Tags Row -->
        <div class="tags-row" v-if="hasTags">
          <span 
            v-for="tag in map.tags" 
            :key="tag" 
            class="tag-badge"
            :title="tag"
          >
            {{ tag }}
          </span>
        </div>
      </footer>

      <div class="card-actions">
        <button class="btn-action secondary" @click="$emit('edit', map)">
          <i class="fas fa-pen"></i>
          <span>Edit</span>
        </button>
        
        <button 
          v-if="!map.isPublished" 
          class="btn-action primary" 
          @click="$emit('publish', map)"
        >
          <i class="fas fa-upload"></i>
          <span>Publish</span>
        </button>
        
        <button 
          v-else 
          class="btn-action ghost" 
          @click="$emit('unpublish', map)"
          title="Unpublish map"
        >
          <i class="fas fa-archive"></i>
        </button>

        <button 
          class="btn-action danger" 
          @click="$emit('delete', map)"
          title="Delete map"
        >
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'ProfileMapsCard',
  props: {
    map: {
      type: Object,
      required: true
    },
    username: {
      type: String,
      default: null
    }
  },
  emits: ['edit', 'publish', 'unpublish', 'delete'],
  computed: {
    hasThumbnail() {
      return Boolean(this.map.thumbnail)
    },
    coverStyle() {
      if (!this.hasThumbnail) return {}
      return {
        backgroundImage: `url(${this.map.thumbnail})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    },
    statusLabel() {
      return this.map.isPublished ? 'Published' : 'Draft'
    },
    statusIcon() {
      return this.map.isPublished ? 'fas fa-globe' : 'fas fa-pen-ruler'
    },
    statusClass() {
      return this.map.isPublished ? 'is-published' : 'is-draft'
    },
    subtitle() {
      return this.map.isPublished ? 'Live Map' : 'Draft Map'
    },
    poiCountNumber() {
      return Number.isFinite(this.map.poiCount)
        ? this.map.poiCount
        : 0
    },
    poiIconClass() {
      return this.poiCountNumber === 0
        ? 'fas fa-triangle-exclamation'
        : 'fas fa-location-dot'
    },
    poiTitle() {
      return this.poiCountNumber === 0
        ? 'Empty map — add some POIs to bring this map to life.'
        : 'Number of POIs'
    },
    formattedUpdated() {
      if (!this.map.lastUpdated) return 'New'
      try {
        const date = new Date(this.map.lastUpdated)
        const now = new Date()
        const diffTime = Math.abs(now - date)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 1) return 'Today'
        if (diffDays <= 7) return `${diffDays}d ago`
        
        return new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric'
        }).format(date)
      } catch (e) {
        return 'Recently'
      }
    },
    poiLabel() {
      const count = this.poiCountNumber

      if (count === 0) {
        return 'Empty!'
      }

      if (count === 1) {
        return '1 POI'
      }

      return `${count} POIs`
    },
    initials() {
      if (!this.map.title) return 'MAP'
      return this.map.title
        .split(/\s+/)
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()
    },
    hasIndicators() {
      return this.map.hasAudio || (this.map.poisWithImages > 0)
    },
    hasTags() {
      return Array.isArray(this.map.tags) && this.map.tags.length > 0
    },
    formattedPrice() {
      if (!this.map.price) return ''
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(this.map.price)
    }
  },
  methods: {
    handlePreview(event) {
      if (!this.map.slug || !this.username) {
        return
      }
      if (this.$router) {
        this.$router.push({
          name: 'published-map',
          params: {
            username: this.username,
            slug: this.map.slug
          }
        })
      } else {
        window.location.href = `/u/${this.username}/${this.map.slug}`
      }
    }
  }
}
</script>

<style scoped>
.map-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  min-height: 380px;
}

.map-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  border-color: var(--secondary-light);
}

/* Media Section */
.card-media {
  height: 160px;
  position: relative;
  background: var(--bg-secondary);
  overflow: hidden;
}

.card-media:not(.has-thumbnail) {
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-light) 100%);
}

.media-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.placeholder-content i {
  font-size: 1.5rem;
  opacity: 0.5;
}

.initials {
  font-weight: 700;
  letter-spacing: 0.1em;
  font-size: var(--font-size-lg);
}

/* Overlays */
.status-badge {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 2;
}

.status-badge.is-published {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-badge.is-draft {
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-secondary);
  border: 1px solid rgba(0,0,0,0.05);
}

.media-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: var(--spacing-sm);
  background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
  display: flex;
  justify-content: flex-start;
}

.slug-badge {
  font-size: var(--font-size-xs);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  gap: 4px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

/* Content Section */
.card-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-header {
  margin-bottom: var(--spacing-sm);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.eyebrow {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--secondary-color);
  font-weight: 700;
  margin: 0;
}

.view-as-link {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--secondary-color);
  font-weight: 700;
  text-decoration: none;
  transition: all var(--transition-fast);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  background: var(--bg-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.view-as-link:hover {
  color: var(--secondary-color);
  background: var(--bg-tertiary);
  border-color: var(--secondary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.title {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.summary {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
}

/* Footer Meta */
.card-footer {
  border-top: 1px solid var(--border-light);
  padding-top: var(--spacing-md);
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md); /* Space for actions */
}

.meta-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-divider {
  width: 3px;
  height: 3px;
  background: var(--border-light);
  border-radius: 50%;
}

.location-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.location-row i {
  margin-top: 2px;
  color: var(--text-tertiary);
}

.location-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Tags */
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2xs);
  padding-top: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  border-top: 1px solid var(--border-light);
}

.tag-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-2xs);
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all var(--transition-fast);
}

.tag-badge:hover {
  background: var(--bg-tertiary);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

/* Price Badge */
.price-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 2;
  background: rgba(34, 197, 94, 0.95);
  color: white;
}

.price-badge i {
  font-size: 0.7rem;
}

/* Pricing Row */
.pricing-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-xs);
  margin-top: var(--spacing-xs);
  border-top: 1px solid var(--border-light);
}

.pricing-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.pricing-info i {
  color: var(--secondary-color);
}

.pricing-label {
  font-weight: 600;
  color: var(--text-secondary);
}

.pricing-value {
  font-weight: 700;
  color: var(--secondary-color);
  margin-left: auto;
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.btn-action {
  flex: 1;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: 6px 12px;
  font-size: var(--font-size-sm);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-action.primary {
  background: var(--secondary-color);
  color: white;
}

.btn-action.primary:hover {
  filter: brightness(1.1);
}

.btn-action.secondary {
  background: transparent;
  border-color: var(--border-light);
  color: var(--text-primary);
}

.btn-action.secondary:hover {
  border-color: var(--text-secondary);
  background: var(--bg-secondary);
}

.btn-action.ghost {
  background: transparent;
  color: var(--text-tertiary);
  flex: 0 0 auto;
  padding: 6px 10px;
}

.btn-action.ghost:hover {
  color: var(--error-color);
  background: rgba(239, 68, 68, 0.1);
}

.btn-action.danger {
  background: transparent;
  border-color: rgba(239, 68, 68, 0.35);
  color: var(--error-color);
  flex: 0 0 auto;
  padding: 6px 10px;
}

.btn-action.danger:hover {
  background: rgba(239, 68, 68, 0.08);
}
</style>
