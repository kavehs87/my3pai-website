<template>
  <div class="creator-profile">
    <!-- Main Website Header -->
    <Header />
    
    <!-- Header Section -->
    <div class="profile-header">
      <div class="cover-image">
        <img :src="creator.featuredPlan?.thumbnail || creator.coverImage" :alt="creator.featuredPlan?.title || (creator.name + ' cover')" @error="handleImageError" />
        <div class="cover-overlay"></div>
      </div>
      
      <div class="profile-info">
        <div class="container">
          <div class="profile-content">
            <div class="main-info">
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
              
              <!-- Tier + Rating -->
              <div class="tier-rating" v-if="creator.tier || creator.rating">
                <span v-if="creator.tier" class="tier-badge" :class="`tier-${creator.tier.toLowerCase()}`">{{ creator.tier }}</span>
                <div v-if="creator.rating" class="rating-wrap">
                  <span class="stars">
                    <i v-for="i in 5" :key="i" :class="i <= roundedRating ? 'fas fa-star' : 'far fa-star'"></i>
                  </span>
                  <span class="rating-value" v-if="creator.rating?.value">{{ creator.rating.value.toFixed(1) }}</span>
                  <span class="rating-count" v-if="creator.rating?.count">({{ creator.rating.count }})</span>
                </div>
                <span class="verify-text" :class="{ unverified: !creator.verified }">{{ creator.verified ? 'Verified' : 'Unverified' }}</span>
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
              
              <!-- Countries visited -->
              <div v-if="creator.countriesVisited?.length" class="countries-visited">
                <h3>Countries Visited ({{ creator.countriesVisited.length }})</h3>
                <div class="flag-list">
                  <span v-for="code in creator.countriesVisited" :key="code" class="flag-item">{{ countryFlag(code) }}</span>
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

              <!-- Languages -->
              <div v-if="creator.languages?.length" class="languages">
                <h3>Languages</h3>
                <div class="language-tags">
                  <span v-for="lang in creator.languages" :key="lang.name" class="language-tag">
                    {{ lang.name }}<span v-if="lang.proficiency" class="proficiency">{{ lang.proficiency }}</span>
                  </span>
                </div>
              </div>

              <!-- Social Links -->
              <div v-if="creator.socialLinks?.length" class="social-links">
                <h3>Social</h3>
                <div class="social-items">
                  <a v-for="link in creator.socialLinks"
                     :key="link.url"
                     :href="link.url"
                     :class="['social-link', platformClass(link.platform)]"
                     target="_blank"
                     rel="noopener noreferrer nofollow"
                  >
                    <i :class="socialIcon(link.platform)"></i>
                  </a>
                </div>
              </div>

              <!-- Partnerships (badges) -->
              <div v-if="creator.partnerships?.length" class="partnerships">
                <h3>Partnerships</h3>
                <div class="partner-badges">
                  <a v-for="p in creator.partnerships"
                     :key="p.url"
                     :href="p.url"
                     class="partner-badge"
                     target="_blank"
                     rel="noopener noreferrer nofollow"
                  >
                    <i class="fas fa-handshake"></i>
                    <span>{{ p.label }}</span>
                  </a>
                </div>
              </div>
              
              <!-- close profile-details -->
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

            <!-- Close main-info before starting sidebar -->
            
            <!-- Right column: recent plans -->
            <aside class="recent-plans-sidebar">
              <h3>Recent Plans</h3>
              <div class="plans-grid sidebar-grid">
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
            </aside>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Section removed; featured shown as cover, recent moved to header sidebar -->
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
  computed: {
    roundedRating() {
      const value = this.creator?.rating?.value || 0
      return Math.round(value)
    }
  },
  created() {
    this.loadCreator()
  },
  mounted() {
    // Scroll to top when profile page loads
    window.scrollTo(0, 0)
  },
  methods: {
    socialIcon(platform) {
      const p = (platform || '').toLowerCase()
      if (p.includes('youtube')) return 'fa-brands fa-youtube'
      if (p.includes('instagram')) return 'fa-brands fa-instagram'
      if (p.includes('tiktok')) return 'fa-brands fa-tiktok'
      if (p.includes('twitter') || p.includes('x')) return 'fa-brands fa-x-twitter'
      return 'fa-solid fa-link'
    },

    platformClass(platform) {
      const p = (platform || '').toLowerCase()
      if (p.includes('youtube')) return 'platform-youtube'
      if (p.includes('instagram')) return 'platform-instagram'
      if (p.includes('tiktok')) return 'platform-tiktok'
      if (p.includes('twitter') || p.includes('x')) return 'platform-twitter'
      return 'platform-generic'
    },

    countryFlag(code) {
      // Convert ISO country code to regional indicator symbols
      if (!code) return ''
      const cc = code.toUpperCase()
      return cc
        .replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
    },

    

    loadCreator() {
      const creatorId = parseInt(this.$route.params.id)
      this.creator = creatorsData.creators.find(c => c.id === creatorId)
      
      if (!this.creator) {
        // Create a fallback creator for IDs not in creators.json
        this.creator = {
          id: creatorId,
          name: `Creator ${creatorId}`,
          username: `@creator${creatorId}`,
          avatar: `https://i.pravatar.cc/140?img=${creatorId}`,
          coverImage: '/photos/photo_2025-10-28_00-02-25.jpg',
          followers: '100K',
          following: '1K',
          totalPlans: 10,
          totalViews: '1M',
          totalLikes: '50K',
          verified: false,
          bio: 'Travel content creator sharing amazing experiences.',
          location: 'Unknown',
          joinedDate: '2023-01-01',
          specialties: ['Travel', 'Adventure'],
          featuredPlan: {
            id: creatorId,
            title: 'Featured Plan',
            thumbnail: '/photos/photo_2025-10-28_00-02-27.jpg',
            views: '100K',
            likes: '5K'
          },
          recentPlans: [
            {
              id: creatorId * 10 + 1,
              title: 'Recent Plan 1',
              thumbnail: '/photos/photo_2025-10-28_00-02-29.jpg',
              views: '50K'
            },
            {
              id: creatorId * 10 + 2,
              title: 'Recent Plan 2',
              thumbnail: '/photos/photo_2025-10-28_00-02-31.jpg',
              views: '30K'
            }
          ]
        }
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
  height: 400px;
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

.profile-content { display: grid; grid-template-columns: 2fr 1fr; gap: var(--spacing-2xl); }

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

.profile-details { flex: 1; }
.main-info { display: flex; align-items: flex-start; gap: var(--spacing-2xl); }
.recent-plans-sidebar { position: sticky; top: 120px; height: fit-content; }
.sidebar-grid { grid-template-columns: 1fr; }

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

.tier-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin: 0 0 var(--spacing-lg) 0;
}

.tier-badge {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: 700;
}
.tier-platinum { background: linear-gradient(90deg, #e5e7eb, #f9fafb); color: #111827; border: 1px solid #e5e7eb; }
.tier-gold { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
.tier-silver { background: #e5e7eb; color: #374151; border: 1px solid #d1d5db; }
.tier-bronze { background: #fce7f3; color: #9f1239; border: 1px solid #fbcfe8; }

.rating-wrap { display: flex; align-items: center; gap: 6px; }
.stars i { color: #f59e0b; }
.rating-value { color: var(--text-primary); font-weight: 600; }
.rating-count { color: var(--text-secondary); font-size: var(--font-size-sm); }
.verify-text { color: var(--secondary-color); font-weight: 600; }
.verify-text.unverified { color: #ef4444; }

.countries-visited h3,
.languages h3,
.social-links h3,
.partnerships h3 {
  font-size: var(--font-size-lg);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;
}

.flag-list { display: flex; flex-wrap: wrap; gap: 8px; }
.flag-item { font-size: 20px; }

.language-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.language-tag { background: var(--bg-secondary); color: var(--text-primary); padding: 4px 10px; border-radius: var(--radius-full); font-size: var(--font-size-sm); }
.language-tag .proficiency { margin-left: 6px; color: var(--text-secondary); font-weight: 500; }

.languages { margin-bottom: var(--spacing-xl); }
.social-links { margin-bottom: var(--spacing-2xl); }
.social-items { display: flex; flex-wrap: wrap; column-gap: 12px; row-gap: 10px; }
.social-link { display: inline-flex; align-items: center; padding: 8px 10px; border: 1px solid var(--border-light); border-radius: var(--radius-sm); background: transparent; text-decoration: none; transition: all var(--transition-normal); filter: grayscale(100%); }
.social-link i { font-size: 16px; }
.social-link:hover { filter: grayscale(0%); background: var(--bg-secondary); }

/* Platform hover colors */
.platform-youtube:hover i { color: #ff0000; }
.platform-instagram:hover i { color: #e1306c; }
.platform-tiktok:hover i { color: #25f4ee; }
.platform-twitter:hover i { color: #1d9bf0; }
.platform-generic:hover i { color: var(--secondary-color); }

.partnerships { margin-top: var(--spacing-xl); }
.partner-badges { display: flex; flex-wrap: wrap; gap: 10px; }
.partner-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  text-decoration: none;
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}
.partner-badge i { color: var(--secondary-color); }
.partner-badge:hover {
  background: #ecfeff;
  border-color: #a5f3fc;
  transform: translateY(-1px);
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

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-2xl);
}

.sidebar { position: sticky; top: 100px; height: fit-content; }

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
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
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
  .profile-content { display: block; }
  .main-info { flex-direction: column; align-items: center; text-align: center; }
  .recent-plans-sidebar { position: static; margin-top: var(--spacing-xl); }
  
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
