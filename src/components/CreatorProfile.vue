<template>
  <div class="creator-profile">
    <!-- Main Website Header -->
    <Header />
    
    <!-- Header Section -->
    <div class="profile-header">
      <div class="cover-image">
        <img :src="creator.coverImage" :alt="creator.name + ' cover'" @error="handleImageError" />
        <div class="cover-overlay"></div>
      </div>
      
      <div class="profile-info">
        <div class="container">
          <div class="profile-content">
            <div class="avatar-section">
              <img :src="creator.avatar" :alt="creator.name" class="profile-avatar" @error="handleAvatarError" />
              <div class="verified-badge" v-if="creator.verified">
                <i class="fas fa-check"></i>
              </div>
            </div>
            
            <div class="profile-details">
              <h1 class="creator-name">{{ creator.name }}</h1>
              <p class="creator-username">{{ creator.username }}</p>
              <p class="creator-bio">{{ creator.bio }}</p>
              
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ creator.followers }}</span>
                  <span class="stat-label">Followers</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ creator.following }}</span>
                  <span class="stat-label">Following</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ creator.totalPlans }}</span>
                  <span class="stat-label">Plans</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ creator.totalViews }}</span>
                  <span class="stat-label">Views</span>
                </div>
              </div>
              
              <div class="profile-meta">
                <div class="location">
                  <i class="fas fa-map-marker-alt"></i>
                  <span>{{ creator.location }}</span>
                </div>
                <div class="joined-date">
                  <i class="fas fa-calendar"></i>
                  <span>Joined {{ formatDate(creator.joinedDate) }}</span>
                </div>
              </div>
              
              <div class="specialties">
                <h3>Specialties</h3>
                <div class="specialty-tags">
                  <span v-for="specialty in creator.specialties" :key="specialty" class="specialty-tag">
                    {{ specialty }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="profile-actions">
              <button class="follow-btn" @click="toggleFollow">
                <i class="fas fa-plus"></i>
                {{ isFollowing ? 'Following' : 'Follow' }}
              </button>
              <button class="share-btn" @click="shareProfile">
                <i class="fas fa-share"></i>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="profile-content-section">
      <div class="container">
        <!-- Featured Plan -->
        <div class="featured-plan-section">
          <h2>Featured Plan</h2>
          <div class="featured-plan-card" @click="viewPlan(creator.featuredPlan.id)">
            <img :src="creator.featuredPlan.thumbnail" :alt="creator.featuredPlan.title" @error="handleImageError" />
            <div class="plan-overlay">
              <div class="plan-info">
                <h3>{{ creator.featuredPlan.title }}</h3>
                <div class="plan-stats">
                  <span><i class="fas fa-eye"></i> {{ creator.featuredPlan.views }}</span>
                  <span><i class="fas fa-heart"></i> {{ creator.featuredPlan.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Plans -->
        <div class="recent-plans-section">
          <h2>Recent Plans</h2>
          <div class="plans-grid">
            <div 
              v-for="plan in creator.recentPlans" 
              :key="plan.id" 
              class="plan-card"
              @click="viewPlan(plan.id)"
            >
              <img :src="plan.thumbnail" :alt="plan.title" @error="handleImageError" />
              <div class="plan-info">
                <h4>{{ plan.title }}</h4>
                <div class="plan-stats">
                  <span><i class="fas fa-eye"></i> {{ plan.views }}</span>
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
import Header from './Header.vue'
import creatorsData from '../data/creators.json'

export default {
  name: 'CreatorProfile',
  components: {
    Header
  },
  data() {
    return {
      creator: null,
      isFollowing: false
    }
  },
  created() {
    this.loadCreator()
  },
  methods: {
    loadCreator() {
      const creatorId = parseInt(this.$route.params.id)
      this.creator = creatorsData.creators.find(c => c.id === creatorId)
      
      if (!this.creator) {
        // Redirect to 404 or home if creator not found
        this.$router.push('/')
      }
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    },
    
    toggleFollow() {
      this.isFollowing = !this.isFollowing
      console.log(this.isFollowing ? 'Following' : 'Unfollowed', this.creator.name)
    },
    
    shareProfile() {
      if (navigator.share) {
        navigator.share({
          title: `${this.creator.name} - Travel Creator`,
          text: `Check out ${this.creator.name}'s travel plans on my3pai.com`,
          url: window.location.href
        })
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href)
        console.log('Profile URL copied to clipboard')
      }
    },
    
    viewPlan(planId) {
      console.log('Viewing plan:', planId)
      // TODO: Navigate to plan detail page
    },
    
    handleImageError(event) {
      event.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=300&fit=crop'
    },
    
    handleAvatarError(event) {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iNDAiIGZpbGw9IiM2NjdFRUEiLz4KPHRleHQgeD0iNDAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QTwvdGV4dD4KPC9zdmc+'
    }
  }
}
</script>

<style scoped>
.creator-profile {
  min-height: 100vh;
  background: var(--bg-primary);
}

.profile-header {
  position: relative;
  margin-top: 0;
}

.cover-image {
  height: 300px;
  position: relative;
  overflow: hidden;
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
}

.profile-info {
  background: var(--bg-primary);
  padding: var(--spacing-2xl) 0;
  margin-top: -80px;
  position: relative;
  z-index: 10;
}

.profile-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2xl);
}

.avatar-section {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--bg-primary);
  object-fit: cover;
}

.verified-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  background: var(--secondary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  font-size: 14px;
  border: 3px solid var(--bg-primary);
}

.profile-details {
  flex: 1;
}

.creator-name {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs) 0;
}

.creator-username {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

.creator-bio {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-lg) 0;
}

.profile-stats {
  display: flex;
  gap: var(--spacing-xl);
  margin: 0 0 var(--spacing-lg) 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.profile-meta {
  display: flex;
  gap: var(--spacing-lg);
  margin: 0 0 var(--spacing-lg) 0;
}

.location,
.joined-date {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.location i,
.joined-date i {
  color: var(--secondary-color);
}

.specialties h3 {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.specialty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.specialty-tag {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.profile-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.follow-btn,
.share-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  min-width: 120px;
}

.follow-btn {
  background: var(--secondary-color);
  color: var(--bg-primary);
  border: none;
}

.follow-btn:hover {
  background: #059669;
  transform: translateY(-2px);
}

.share-btn {
  background: transparent;
  color: var(--text-primary);
  border: 2px solid var(--border-light);
}

.share-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--secondary-color);
}

.profile-content-section {
  padding: var(--spacing-3xl) 0;
}

.featured-plan-section,
.recent-plans-section {
  margin-bottom: var(--spacing-3xl);
}

.featured-plan-section h2,
.recent-plans-section h2 {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xl) 0;
}

.featured-plan-card {
  position: relative;
  height: 300px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.featured-plan-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.featured-plan-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plan-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  padding: var(--spacing-xl);
  color: var(--bg-primary);
}

.plan-overlay h3 {
  font-size: var(--font-size-xl);
  margin: 0 0 var(--spacing-sm) 0;
}

.plan-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.plan-stats span {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.plan-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-light);
}

.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.plan-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.plan-card .plan-info {
  padding: var(--spacing-md);
}

.plan-card h4 {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  font-weight: 600;
}

.plan-card .plan-stats {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-stats {
    justify-content: center;
  }
  
  .profile-meta {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
  }
  
  .profile-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .plans-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }
}
</style>
