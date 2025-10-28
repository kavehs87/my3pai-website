<template>
  <div class="video-plans">
    <div class="container">
      <div class="section-header">
        <h2>Travel Plans</h2>
        <p>Discover amazing travel itineraries from our community creators</p>
      </div>

      <div class="video-grid">
        <div 
          v-for="plan in plans" 
          :key="plan.id" 
          class="video-card"
          @click="selectPlan(plan)"
        >
          <div class="video-thumbnail">
            <img :src="plan.thumbnail" :alt="plan.title" />
            <div class="video-overlay">
              <div class="platform-badge" :class="plan.platform">
                <i :class="getPlatformIcon(plan.platform)"></i>
              </div>
              <div class="video-duration">{{ plan.duration }}</div>
              <div class="play-button">
                <i class="fas fa-play"></i>
              </div>
            </div>
          </div>

          <div class="video-content">
            <div class="creator-info">
              <img :src="plan.creator.avatar" :alt="plan.creator.name" class="creator-avatar" />
              <div class="creator-details">
                <router-link :to="{ name: 'creator-profile', params: { id: plan.creator.id } }" class="creator-name">
                  {{ plan.creator.name }}
                </router-link>
                <span class="creator-followers">{{ plan.creator.followers }} followers</span>
              </div>
              <button class="clone-btn">Customize</button>
            </div>

            <h3 class="video-title">{{ plan.title }}</h3>
            <p class="video-description">{{ plan.description }}</p>

            <div class="video-stats">
              <div class="stat">
                <i class="fas fa-eye"></i>
                <span>{{ plan.views }}</span>
              </div>
              <div class="stat">
                <i class="fas fa-heart"></i>
                <span>{{ plan.likes }}</span>
              </div>
              <div class="stat">
                <i class="fas fa-comment"></i>
                <span>{{ plan.comments }}</span>
              </div>
            </div>

            <div class="plan-meta">
              <div class="meta-item">
                <i class="fas fa-signal"></i>
                <span class="difficulty" :class="plan.difficulty">{{ plan.difficulty }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-dollar-sign"></i>
                <span>{{ plan.budget }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-calendar"></i>
                <span>{{ formatDate(plan.createdAt) }}</span>
              </div>
            </div>

            <div class="video-tags">
              <span 
                v-for="tag in plan.tags.slice(0, 3)" 
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
  </div>
</template>

<script>
import plansData from '../data/plans.json'

export default {
  name: 'VideoPlans',
  data() {
    return {
      plans: plansData.plans
    }
  },
  methods: {
    getPlatformIcon(platform) {
      const icons = {
        youtube: 'fab fa-youtube',
        instagram: 'fab fa-instagram',
        tiktok: 'fab fa-tiktok'
      }
      return icons[platform] || 'fas fa-video'
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    },
    selectPlan(plan) {
      console.log('Selected plan:', plan)
      // TODO: Navigate to plan detail page or open video modal
    }
  }
}
</script>

<style scoped>
.video-plans {
  padding: var(--spacing-3xl) 0;
  background: var(--bg-secondary);
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--spacing-xl);
  margin-top: var(--spacing-2xl);
}

.video-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 4px 20px var(--shadow-light);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.video-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.video-thumbnail {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.video-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.video-card:hover .video-thumbnail img {
  transform: scale(1.05);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.video-card:hover .video-overlay {
  opacity: 1;
}

.platform-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  font-size: var(--font-size-sm);
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

.video-duration {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.8);
  color: var(--bg-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.play-button {
  width: 60px;
  height: 60px;
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

.video-content {
  padding: var(--spacing-lg);
}

.creator-info {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
  gap: var(--spacing-sm);
}

.creator-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.creator-details {
  flex: 1;
}

.creator-name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-primary);
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
  color: var(--text-secondary);
  margin: 0;
}

.clone-btn {
  background: var(--secondary-color);
  color: var(--bg-primary);
  border: none;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-xl);
  font-size: var(--font-size-xs);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-normal);
}

.clone-btn:hover {
  background: var(--primary-hover);
}

.video-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  line-height: 1.4;
}

.video-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0 0 var(--spacing-md) 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-stats {
  display: flex;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.stat i {
  font-size: var(--font-size-xs);
  color: var(--primary-color);
}

.plan-meta {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.meta-item i {
  font-size: var(--font-size-xs);
  color: var(--primary-color);
}

.difficulty {
  text-transform: capitalize;
  font-weight: 600;
}

.video-tags {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.tag {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .video-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .video-content {
    padding: var(--spacing-md);
  }
  
  .plan-meta {
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .video-plans {
    padding: var(--spacing-2xl) 0;
  }
  
  .video-grid {
    gap: var(--spacing-md);
  }
}
</style>
