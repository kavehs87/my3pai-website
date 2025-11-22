<template>
  <div class="user-profile-about">
    <h2 class="about-title">About</h2>
    <div class="about-content">
      <p 
        v-for="(paragraph, index) in bioParagraphs" 
        :key="index"
        class="about-paragraph"
      >
        {{ paragraph }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserProfileAbout',
  props: {
    bio: {
      type: String,
      required: true
    }
  },
  computed: {
    bioParagraphs() {
      if (!this.bio) return []
      
      // Split bio by double newlines or periods followed by space and capital letter
      // This creates natural paragraph breaks
      const paragraphs = this.bio
        .split(/\n\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
      
      // If no double newlines, try splitting by sentence boundaries
      if (paragraphs.length === 1) {
        // Split by period + space + capital letter (sentence boundaries)
        const sentences = this.bio.match(/[^.!?]+[.!?]+/g) || [this.bio]
        return sentences.map(s => s.trim()).filter(s => s.length > 0)
      }
      
      return paragraphs
    }
  }
}
</script>

<style scoped>
.user-profile-about {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.about-title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--text-primary);
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.about-paragraph {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>

