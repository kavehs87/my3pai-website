<template>
  <div class="destination-card card">
    <div class="card-image">
      <img :src="destination.image" :alt="destination.name" />
      <div class="card-overlay">
        <button class="save-btn" @click="toggleSave">
          <i :class="isSaved ? 'fas fa-heart' : 'far fa-heart'"></i>
        </button>
      </div>
    </div>
    
    <div class="card-content">
      <div class="card-header">
        <h3 class="destination-name">{{ destination.name }}</h3>
        <div class="rating">
          <div class="stars">
            <i v-for="star in 5" :key="star" 
               :class="star <= Math.floor(destination.rating) ? 'fas fa-star' : 'far fa-star'">
            </i>
          </div>
          <span class="rating-text">{{ destination.rating }}</span>
          <span class="reviews">({{ destination.reviews.toLocaleString() }} reviews)</span>
        </div>
      </div>
      
      <p class="destination-description">{{ destination.description }}</p>
      
      <div class="highlights">
        <span v-for="highlight in destination.highlights.slice(0, 3)" :key="highlight" class="highlight-tag">
          {{ highlight }}
        </span>
      </div>
      
      <div class="card-footer">
        <div class="price-range">
          <span class="price-tag">{{ destination.price }}</span>
        </div>
        <button class="btn btn-primary">View Details</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DestinationCard',
  props: {
    destination: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isSaved: false
    }
  },
  methods: {
    toggleSave() {
      this.isSaved = !this.isSaved
    }
  }
}
</script>

<style scoped>
.destination-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.destination-card:hover .card-image img {
  transform: scale(1.05);
}

.card-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.destination-card:hover .card-overlay {
  opacity: 1;
}

.save-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background: white;
  transform: scale(1.1);
}

.save-btn i {
  color: #ef4444;
  font-size: 16px;
}

.card-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 12px;
}

.destination-name {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  color: #fbbf24;
}

.rating-text {
  font-weight: 600;
  color: #1e293b;
}

.reviews {
  color: #64748b;
  font-size: 14px;
}

.destination-description {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
  flex: 1;
}

.highlights {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.highlight-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.price-range {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .card-content {
    padding: 16px;
  }
  
  .destination-name {
    font-size: 18px;
  }
  
  .card-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>
