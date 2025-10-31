<template>
  <div class="profile-header">
    <div class="cover-image">
      <img :src="user.coverImage" :alt="user.firstName + ' cover'" @error="handleCoverError" />
      <div class="cover-overlay"></div>
      <button class="edit-cover-btn" @click="editCover" title="Edit cover photo">
        <i class="fas fa-camera"></i>
      </button>
    </div>
    
    <div class="profile-info">
      <div class="container">
        <div class="profile-content">
          <div class="avatar-section">
            <img :src="user.avatar" :alt="user.firstName" class="profile-avatar" @error="handleAvatarError" />
            <button class="edit-avatar-btn" @click="editAvatar" title="Edit profile photo">
              <i class="fas fa-camera"></i>
            </button>
            <div class="verified-badge" v-if="user.verified">
              <i class="fas fa-check"></i>
            </div>
          </div>
          
          <div class="profile-details">
            <div class="name-section">
              <h1 class="user-name">{{ user.firstName }} {{ user.lastName }}</h1>
              <button class="edit-profile-btn" @click="$emit('edit-profile')">
                <i class="fas fa-edit"></i>
                Edit Profile
              </button>
            </div>
            <p class="user-username">{{ user.username }}</p>
            <p class="user-bio" v-if="user.bio">{{ user.bio }}</p>
            
            <div class="profile-meta">
              <div class="location" v-if="user.location">
                <i class="fas fa-map-marker-alt"></i>
                <span>{{ user.location }}</span>
              </div>
            <div class="joined-date">
              <i class="fas fa-calendar"></i>
              <span>Joined {{ formatDate(user.joinedDate || user.created_at) }}</span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProfileHeader',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    },
    editCover() {
      this.$emit('edit-cover')
    },
    editAvatar() {
      this.$emit('edit-avatar')
    },
    handleCoverError(event) {
      event.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop'
    },
    handleAvatarError(event) {
      event.target.src = 'https://i.pravatar.cc/200?img=41'
    }
  }
}
</script>

<style scoped>
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
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.5));
}

.edit-cover-btn {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
  z-index: 10;
}

.edit-cover-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
}

.profile-info {
  background: var(--bg-primary);
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  margin-top: -80px;
  position: relative;
  z-index: 10;
}

.profile-content {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-xl);
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.edit-avatar-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 36px;
  height: 36px;
  background: var(--secondary-color);
  border: 3px solid var(--bg-primary);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  transition: all var(--transition-normal);
}

.edit-avatar-btn:hover {
  background: var(--secondary-hover);
  transform: scale(1.1);
}

.verified-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
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
  min-width: 0;
}

.name-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
  flex-wrap: wrap;
}

.user-name {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.edit-profile-btn {
  background: transparent;
  border: 1px solid var(--border-light);
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  transition: all var(--transition-normal);
  font-weight: 500;
}

.edit-profile-btn:hover {
  background: var(--bg-secondary);
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.user-username {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

.user-bio {
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0 0 var(--spacing-lg) 0;
}

.profile-meta {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
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

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .name-section {
    justify-content: center;
  }
  
  .profile-meta {
    justify-content: center;
  }
}
</style>

