<template>
  <div class="user-profile-header">
    <!-- Profile Picture -->
    <div class="profile-picture-wrapper">
      <img 
        :src="avatarUrl" 
        :alt="displayName"
        class="profile-picture"
      />
    </div>

    <!-- Name -->
    <h1 class="user-name">{{ displayName }}</h1>

    <!-- Username -->
    <p v-if="username" class="username">@{{ username }}</p>

    <!-- Location -->
    <div v-if="location" class="location-info">
      <i class="fas fa-map-marker-alt"></i>
      <span>{{ location }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfileHeader',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  computed: {
    displayName() {
      if (this.user.firstName && this.user.lastName) {
        return `${this.user.firstName} ${this.user.lastName}`
      }
      return this.user.firstName || this.user.lastName || 'User'
    },
    username() {
      // Remove @ if present
      const uname = this.user.username || ''
      return uname.startsWith('@') ? uname.slice(1) : uname
    },
    avatarUrl() {
      return this.user.avatar || 'https://i.pravatar.cc/200?img=41'
    },
    location() {
      return this.user.location || null
    }
  }
}
</script>

<style scoped>
.user-profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-md);
}

.profile-picture-wrapper {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  overflow: hidden;
  border: 3px solid var(--border-light);
  background: var(--bg-secondary);
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.username {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  font-weight: 500;
}

.location-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.location-info i {
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}
</style>

