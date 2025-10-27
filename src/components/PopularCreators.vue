<template>
  <div class="popular-creators">
    <div class="container">
      <div class="section-header">
        <h2>Popular Creators</h2>
        <p>Follow top travel creators and discover their amazing itineraries</p>
      </div>

      <div class="creators-grid">
        <div 
          v-for="creator in creators" 
          :key="creator.id" 
          class="creator-card"
          @click="selectCreator(creator)"
        >
          <div class="creator-cover">
            <img :src="creator.coverImage" :alt="creator.name" @error="handleImageError" />
            <div class="creator-overlay">
              <div class="creator-avatar">
                <img :src="creator.avatar" :alt="creator.name" @error="handleAvatarError" />
                <div class="verified-badge" v-if="creator.verified">
                  <i class="fas fa-check"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="creator-content">
            <div class="creator-header">
              <div class="creator-info">
                <h3 class="creator-name">{{ creator.name }}</h3>
                <p class="creator-username">{{ creator.username }}</p>
                <p class="creator-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ creator.location }}
                </p>
              </div>
              <button 
                class="follow-btn" 
                :class="{ 'following': creator.isFollowing }"
                @click.stop="toggleFollow(creator)"
              >
                <i class="fas fa-plus" v-if="!creator.isFollowing"></i>
                <i class="fas fa-check" v-else></i>
                {{ creator.isFollowing ? 'Following' : 'Follow' }}
              </button>
            </div>

            <p class="creator-bio">{{ creator.bio }}</p>

            <div class="creator-stats">
              <div class="stat">
                <span class="stat-number">{{ creator.followers }}</span>
                <span class="stat-label">Followers</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ creator.totalPlans }}</span>
                <span class="stat-label">Plans</span>
              </div>
              <div class="stat">
                <span class="stat-number">{{ formatNumber(creator.totalViews) }}</span>
                <span class="stat-label">Views</span>
              </div>
            </div>

            <div class="creator-specialties">
              <span 
                v-for="specialty in creator.specialties" 
                :key="specialty" 
                class="specialty-tag"
              >
                {{ specialty }}
              </span>
            </div>

            <div class="featured-plan">
              <h4>Featured Plan</h4>
              <div class="plan-preview" @click.stop="selectPlan(creator.featuredPlan)">
                <img :src="creator.featuredPlan.thumbnail" :alt="creator.featuredPlan.title" @error="handleImageError" />
                <div class="plan-info">
                  <h5>{{ creator.featuredPlan.title }}</h5>
                  <div class="plan-stats">
                    <span class="plan-views">
                      <i class="fas fa-eye"></i>
                      {{ formatNumber(creator.featuredPlan.views) }}
                    </span>
                    <span class="plan-likes">
                      <i class="fas fa-heart"></i>
                      {{ formatNumber(creator.featuredPlan.likes) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="recent-plans">
              <h4>Recent Plans</h4>
              <div class="plans-grid">
                <div 
                  v-for="plan in creator.recentPlans.slice(0, 3)" 
                  :key="plan.id" 
                  class="mini-plan"
                  @click.stop="selectPlan(plan)"
                >
                  <img :src="plan.thumbnail" :alt="plan.title" @error="handleImageError" />
                  <div class="mini-plan-overlay">
                    <span class="mini-plan-views">{{ formatNumber(plan.views) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import creatorsData from '../data/creators.json'

export default {
  name: 'PopularCreators',
  data() {
    return {
      creators: creatorsData.creators.map(creator => ({
        ...creator,
        isFollowing: false
      }))
    }
  },
  methods: {
    formatNumber(num) {
      if (num.includes('M')) return num
      if (num.includes('K')) return num
      const number = parseInt(num.replace(/[^\d]/g, ''))
      if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M'
      if (number >= 1000) return (number / 1000).toFixed(1) + 'K'
      return number.toString()
    },
    toggleFollow(creator) {
      creator.isFollowing = !creator.isFollowing
      console.log(`${creator.isFollowing ? 'Following' : 'Unfollowed'} ${creator.name}`)
    },
    selectCreator(creator) {
      console.log('Selected creator:', creator)
      // TODO: Navigate to creator profile page
    },
    selectPlan(plan) {
      console.log('Selected plan:', plan)
      // TODO: Navigate to plan detail page
    },
    handleImageError(event) {
      // Fallback to a default cover image
      event.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=300&fit=crop'
    },
    handleAvatarError(event) {
      // Fallback to a default avatar - using SVG data URI
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iNDAiIGZpbGw9IiM2NjdFRUEiLz4KPHRleHQgeD0iNDAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QTwvdGV4dD4KPC9zdmc+'
    }
  }
}
</script>

<style scoped>
.popular-creators {
  padding: var(--spacing-3xl) 0;
  background: var(--bg-secondary);
}

.creators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl);
}

.creator-card {
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: 0 4px 20px var(--shadow-light);
  transition: all var(--transition-normal);
  cursor: pointer;
}

.creator-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px var(--shadow-medium);
}

.creator-cover {
  position: relative;
  height: 200px;
}

.creator-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-top-left-radius: var(--radius-xl);
  border-top-right-radius: var(--radius-xl);
}

.creator-overlay {
  position: absolute;
  bottom: -40px;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  z-index: 10;
}

.creator-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.creator-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.verified-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 24px;
  height: 24px;
  background: var(--secondary-color);
  border-radius: 50%;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
}

.creator-content {
  padding: 50px 20px 20px 20px;
}

.creator-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.creator-info {
  flex: 1;
}

.creator-name {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.creator-username {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px 0;
}

.creator-location {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.creator-location i {
  font-size: 11px;
  color: var(--secondary-color);
}

.follow-btn {
  background: var(--secondary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.follow-btn:hover {
  background: #059669;
  transform: scale(1.05);
}

.follow-btn.following {
  background: #e2e8f0;
  color: #64748b;
}

.follow-btn.following:hover {
  background: #cbd5e1;
}

.creator-bio {
  font-size: 14px;
  color: #475569;
  line-height: 1.5;
  margin: 0 0 20px 0;
}

.creator-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.creator-specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.specialty-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.featured-plan {
  margin-bottom: 24px;
}

.featured-plan h4 {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-preview {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.plan-preview:hover {
  background: #f1f5f9;
}

.plan-preview img {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.plan-info {
  flex: 1;
}

.plan-info h5 {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.plan-stats {
  display: flex;
  gap: 16px;
}

.plan-views,
.plan-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.plan-views i,
.plan-likes i {
  font-size: 10px;
  color: var(--secondary-color);
}

.recent-plans h4 {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.mini-plan {
  position: relative;
  aspect-ratio: 4/3;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.mini-plan:hover {
  transform: scale(1.05);
}

.mini-plan img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-plan-overlay {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .creators-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .creator-content {
    padding: 50px 16px 16px 16px;
  }
  
  .creator-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .follow-btn {
    align-self: flex-start;
  }
  
  .creator-stats {
    gap: 16px;
  }
  
  .plans-grid {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .popular-creators {
    padding: 60px 0;
  }
  
  .creator-overlay {
    left: 16px;
    right: 16px;
  }
  
  .creator-avatar {
    width: 70px;
    height: 70px;
  }
  
  .creator-content {
    padding: 40px 16px 16px 16px;
  }
}
</style>
