<template>
  <div class="home">
    <!-- Header -->
    <Header />

    <!-- Hero Section -->
    <AIHeroSection />

    <!-- Video Plans Section -->
    <!-- <VideoPlans /> -->

    <!-- Trips Plans (API) -->
    <TripPlans />

    <!-- Video Shorts Section -->
    <!-- <VideoShorts /> -->

    <!-- Trip Shorts Section -->
    <TripShorts />

    <!-- Popular Creators Section -->
    <!-- <PopularCreators /> -->

    <!-- CTA Section -->
    <CTA />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import Header from './Header.vue'
import AIHeroSection from './AIHeroSection.vue'
import HeroSection from './HeroSection.vue'
import VideoPlans from './VideoPlans.vue'
import TripPlans from './TripPlans.vue'
import VideoShorts from './VideoShorts.vue'
import TripShorts from './TripShorts.vue'
import PopularCreators from './PopularCreators.vue'
import CTA from './CTA.vue'
import DestinationCard from './DestinationCard.vue'
import CategoriesSection from './CategoriesSection.vue'
import Footer from './Footer.vue'
import TripsSection from './TripsSection.vue'

export default {
  name: 'Home',
  components: {
    Header,
    AIHeroSection,
    HeroSection,
    VideoPlans,
    TripPlans,
    VideoShorts,
    TripShorts,
    PopularCreators,
    CTA,
    DestinationCard,
    CategoriesSection,
    Footer
  },
  data() {
    return {}
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


  .hotel-footer {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
}
</style>
