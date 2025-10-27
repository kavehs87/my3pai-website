<template>
  <section class="categories-section">
    <div class="container">
      <div class="section-header">
        <h2>Explore by Category</h2>
        <p>Find exactly what you're looking for</p>
      </div>
      
      <div class="categories-grid">
        <div class="category-card" v-for="category in categories" :key="category.id">
          <div class="category-image">
            <img :src="category.image" :alt="category.name" />
            <div class="category-overlay">
              <i :class="category.icon"></i>
            </div>
          </div>
          <div class="category-content">
            <h3>{{ category.name }}</h3>
            <p>{{ category.description }}</p>
            <div class="category-stats">
              <span>{{ category.count.toLocaleString() }} {{ category.unit }}</span>
            </div>
            <button class="btn btn-secondary">Explore</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CategoriesSection',
  data() {
    return {
      categories: [
        {
          id: 1,
          name: 'Hotels',
          description: 'Find the perfect place to stay',
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
          icon: 'fas fa-bed',
          count: 2500000,
          unit: 'properties'
        },
        {
          id: 2,
          name: 'Restaurants',
          description: 'Discover amazing dining experiences',
          image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
          icon: 'fas fa-utensils',
          count: 1800000,
          unit: 'restaurants'
        },
        {
          id: 3,
          name: 'Things to Do',
          description: 'Plan unforgettable activities',
          image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
          icon: 'fas fa-hiking',
          count: 3200000,
          unit: 'experiences'
        },
        {
          id: 4,
          name: 'Vacation Rentals',
          description: 'Stay like a local',
          image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
          icon: 'fas fa-home',
          count: 1200000,
          unit: 'rentals'
        }
      ]
    }
  }
}
</script>

<style scoped>
.categories-section {
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.category-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.category-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.category-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-card:hover .category-image img {
  transform: scale(1.1);
}

.category-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.8) 0%, rgba(118, 75, 162, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-overlay {
  opacity: 1;
}

.category-overlay i {
  font-size: 48px;
  color: white;
}

.category-content {
  padding: 24px;
}

.category-content h3 {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.category-content p {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 16px;
}

.category-stats {
  margin-bottom: 20px;
}

.category-stats span {
  background: #f1f5f9;
  color: #475569;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .categories-section {
    padding: 60px 0;
  }
  
  .section-header h2 {
    font-size: 28px;
  }
  
  .section-header p {
    font-size: 16px;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .category-content {
    padding: 20px;
  }
}
</style>
