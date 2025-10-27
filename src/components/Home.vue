<template>
  <div class="home">
    <!-- Header -->
    <Header />
    
    <!-- Hero Section -->
    <HeroSection />
    
    <!-- Featured Destinations -->
    <section class="featured-destinations">
      <div class="container">
        <div class="section-header">
          <h2>Popular Destinations</h2>
          <p>Discover the most loved places around the world</p>
        </div>
        
        <div class="destinations-grid grid-3">
          <DestinationCard 
            v-for="destination in destinations" 
            :key="destination.id"
            :destination="destination"
          />
        </div>
        
        <div class="section-footer">
          <button class="btn btn-secondary">View All Destinations</button>
        </div>
      </div>
    </section>
    
    <!-- Categories Section -->
    <CategoriesSection />
    
    <!-- Featured Hotels -->
    <section class="featured-hotels">
      <div class="container">
        <div class="section-header">
          <h2>Featured Hotels</h2>
          <p>Handpicked accommodations for your perfect stay</p>
        </div>
        
        <div class="hotels-grid grid-3">
          <div class="hotel-card card" v-for="hotel in hotels" :key="hotel.id">
            <div class="hotel-image">
              <img :src="hotel.image" :alt="hotel.name" />
              <div class="hotel-overlay">
                <button class="save-btn">
                  <i class="far fa-heart"></i>
                </button>
              </div>
            </div>
            
            <div class="hotel-content">
              <div class="hotel-header">
                <h3>{{ hotel.name }}</h3>
                <div class="rating">
                  <div class="stars">
                    <i v-for="star in 5" :key="star" 
                       :class="star <= Math.floor(hotel.rating) ? 'fas fa-star' : 'far fa-star'">
                    </i>
                  </div>
                  <span class="rating-text">{{ hotel.rating }}</span>
                </div>
              </div>
              
              <p class="hotel-location">
                <i class="fas fa-map-marker-alt"></i>
                {{ hotel.location }}
              </p>
              
              <div class="hotel-amenities">
                <span v-for="amenity in hotel.amenities.slice(0, 3)" :key="amenity" class="amenity-tag">
                  {{ amenity }}
                </span>
              </div>
              
              <div class="hotel-footer">
                <div class="hotel-price">
                  <span class="price">${{ hotel.price }}</span>
                  <span class="price-unit">/night</span>
                </div>
                <button class="btn btn-primary">Book Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join millions of travelers who trust us to plan their perfect trips</p>
          <div class="cta-buttons">
            <button class="btn btn-primary">Start Planning</button>
            <button class="btn btn-secondary">Learn More</button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Header from './Header.vue'
import HeroSection from './HeroSection.vue'
import DestinationCard from './DestinationCard.vue'
import CategoriesSection from './CategoriesSection.vue'
import Footer from './Footer.vue'
import { destinations, hotels } from '../data/dummyData.js'

export default {
  name: 'Home',
  components: {
    Header,
    HeroSection,
    DestinationCard,
    CategoriesSection,
    Footer
  },
  data() {
    return {
      destinations: destinations.slice(0, 6),
      hotels: hotels
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.featured-destinations {
  padding: 80px 0;
  background: #f8fafc;
}

.featured-hotels {
  padding: 80px 0;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 60px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.section-header p {
  font-size: 18px;
  color: #64748b;
}

.section-footer {
  text-align: center;
  margin-top: 40px;
}

.hotel-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.hotel-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.hotel-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hotel-card:hover .hotel-image img {
  transform: scale(1.05);
}

.hotel-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.hotel-card:hover .hotel-overlay {
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

.hotel-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.hotel-header {
  margin-bottom: 12px;
}

.hotel-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.hotel-location {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.hotel-amenities {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.amenity-tag {
  background: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.hotel-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.hotel-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.price-unit {
  color: #64748b;
  font-size: 14px;
}

.cta-section {
  padding: 80px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.cta-content h2 {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
}

.cta-content p {
  font-size: 18px;
  margin-bottom: 32px;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

@media (max-width: 768px) {
  .featured-destinations,
  .featured-hotels {
    padding: 60px 0;
  }
  
  .section-header h2 {
    font-size: 28px;
  }
  
  .section-header p {
    font-size: 16px;
  }
  
  .cta-section {
    padding: 60px 0;
  }
  
  .cta-content h2 {
    font-size: 28px;
  }
  
  .cta-content p {
    font-size: 16px;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .hotel-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>
