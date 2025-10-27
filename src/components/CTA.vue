<template>
  <section class="cta-section">
    <div class="container">
      <div class="cta-content">
        <div class="cta-text">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join millions of travelers who trust us to plan their perfect trips</p>
        </div>
        <div class="cta-buttons">
          <button class="btn btn-primary">
            <i class="fas fa-plane"></i>
            Start Planning
          </button>
          <button class="btn btn-secondary">
            <i class="fas fa-play"></i>
            Watch Demo
          </button>
        </div>
      </div>
      <div class="cta-stats">
        <div class="stat-item">
          <div class="stat-number">2M+</div>
          <div class="stat-label">Travelers</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">50K+</div>
          <div class="stat-label">Plans</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">100+</div>
          <div class="stat-label">Countries</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CTA'
}
</script>

<style scoped>
.cta-section {
  padding: var(--spacing-3xl) 0;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-color) 100%);
  color: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.05"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.05"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.container {
  position: relative;
  z-index: 1;
}

.cta-content {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.cta-text h2 {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  color: var(--bg-primary);
  text-shadow: 0 2px 4px var(--shadow-light);
}

.cta-text p {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-2xl);
  opacity: 0.95;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: var(--spacing-lg);
  justify-content: center;
  align-items: center;
}

.btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 180px;
  justify-content: center;
}

.btn-primary {
  background: var(--bg-primary);
  color: var(--primary-color);
  box-shadow: 0 4px 20px var(--shadow-medium);
}

.btn-primary:hover {
  background: var(--bg-secondary);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px var(--shadow-dark);
}

.btn-primary i {
  font-size: var(--font-size-sm);
}

.btn-secondary {
  background: transparent;
  color: var(--bg-primary);
  border: 2px solid var(--bg-primary);
}

.btn-secondary:hover {
  background: var(--bg-primary);
  color: var(--primary-color);
  transform: translateY(-2px);
}

.btn-secondary i {
  font-size: var(--font-size-sm);
}

.cta-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-2xl);
  max-width: 800px;
  margin: 0 auto;
}

.stat-item {
  text-align: center;
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform var(--transition-normal);
}

.stat-item:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.15);
}

.stat-number {
  font-size: var(--font-size-4xl);
  font-weight: 700;
  color: var(--bg-primary);
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 2px 4px var(--shadow-light);
}

.stat-label {
  font-size: var(--font-size-base);
  color: rgba(255, 255, 255, 0.9);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .cta-section {
    padding: var(--spacing-3xl) 0;
  }
  
  .cta-text h2 {
    font-size: var(--font-size-3xl);
  }
  
  .cta-text p {
    font-size: var(--font-size-lg);
  }
  
  .cta-buttons {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .btn {
    width: 100%;
    max-width: 300px;
  }
  
  .cta-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }
  
  .stat-item {
    padding: var(--spacing-md);
  }
  
  .stat-number {
    font-size: var(--font-size-3xl);
  }
}

@media (max-width: 480px) {
  .cta-text h2 {
    font-size: var(--font-size-2xl);
  }
  
  .cta-text p {
    font-size: var(--font-size-base);
  }
  
  .cta-stats {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
  
  .stat-number {
    font-size: var(--font-size-2xl);
  }
  
  .stat-label {
    font-size: var(--font-size-sm);
  }
}
</style>
