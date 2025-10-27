<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Company Info -->
        <div class="footer-section company-section">
          <div class="footer-logo" style="display: flex; align-items: center;">
            <img src="/logo-small.png" alt="my3pai.com Logo" class="footer-logo-image" style="height: 42px; width: auto; margin-right: 10px;" />
            <span style="font-size: 1.1rem;">My3pai</span>
          </div>
          <p class="footer-description">
            Your trusted companion for discovering amazing destinations around the world. 
            We help you plan unforgettable trips with confidence.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" title="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="social-link" title="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="social-link" title="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-link" title="YouTube">
              <i class="fab fa-youtube"></i>
            </a>
            <a href="#" class="social-link" title="TikTok">
              <i class="fab fa-tiktok"></i>
            </a>
          </div>
        </div>

        <!-- Discover -->
        <div class="footer-section">
          <h4>Discover</h4>
          <ul class="footer-links">
            <li><a href="#">Destinations</a></li>
            <li><a href="#">Travel Guides</a></li>
            <li><a href="#">Things to Do</a></li>
            <li><a href="#">Restaurants</a></li>
            <li><a href="#">Attractions</a></li>
            <li><a href="#">Travel Forums</a></li>
          </ul>
        </div>

        <!-- Travel Services -->
        <div class="footer-section">
          <h4>Travel Services</h4>
          <ul class="footer-links">
            <li><a href="#">Hotels</a></li>
            <li><a href="#">Vacation Rentals</a></li>
            <li><a href="#">Flights</a></li>
            <li><a href="#">Car Rentals</a></li>
            <li><a href="#">Travel Insurance</a></li>
            <li><a href="#">Cruises</a></li>
          </ul>
        </div>

        <!-- Support -->
        <div class="footer-section">
          <h4>Support</h4>
          <ul class="footer-links">
            <li><a href="#">Help Center</a></li>
            <li><a href="#">Safety Center</a></li>
            <li><a href="#">Cancellation Options</a></li>
            <li><a href="#">Report Issue</a></li>
            <li><a href="#">Accessibility</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        <!-- About -->
        <div class="footer-section">
          <h4>About</h4>
          <ul class="footer-links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Investor Relations</a></li>
            <li><a href="#">Advertise</a></li>
          </ul>
        </div>
      </div>

      <!-- App Download Section -->
      <div class="app-download">
        <div class="app-content" style="padding-left: 20px; padding-right: 20px;">
          <div class="app-text">
            <h3>Download the My3PAI App</h3>
            <p>Get instant access to millions of travel reviews and deals</p>
          </div>
          <div class="app-buttons">
            <a href="#" class="app-button" target="_blank" rel="noopener">
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" style="height: 40px;"/>
            </a>
            <a href="#" class="app-button" target="_blank" rel="noopener">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" style="height: 40px;"/>
            </a>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="footer-bottom-left">
            <p>&copy; 2024 my3pai.com, Inc. All rights reserved.</p>
            <div class="footer-bottom-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
              <a href="#">Do Not Sell My Personal Information</a>
            </div>
          </div>
          <div class="footer-bottom-right">
            <div class="language-selector">
              <i class="fas fa-globe"></i>
              <select>
                <option value="en">English (US)</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="it">Italiano</option>
              </select>
            </div>
            <div class="currency-selector">
              <i class="fas fa-dollar-sign"></i>
              <select>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  data() {
    return {
      email: ''
    }
  },
  methods: {
    subscribeNewsletter() {
      if (this.email.trim()) {
        console.log('Subscribing email:', this.email)
        // TODO: Implement newsletter subscription
        this.email = ''
        alert('Thank you for subscribing!')
      }
    }
  }
}
</script>

<style scoped>
.footer {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  padding: var(--spacing-3xl) 0 0;
  border-top: 1px solid var(--border-light);
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-2xl);
}

.footer-section h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.company-section {
  max-width: 300px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
}

.footer-logo-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.footer-description {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
}

.social-links {
  display: flex;
  gap: var(--spacing-sm);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--border-light);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition-normal);
  font-size: var(--font-size-sm);
}

.social-link:hover {
  background: var(--primary-color);
  color: var(--bg-primary);
  transform: translateY(-2px);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: var(--spacing-sm);
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-normal);
}

.footer-links a:hover {
  color: var(--primary-color);
}

.app-download {
  background: var(--primary-color);
  color: var(--bg-primary);
  padding: var(--spacing-xl) 0;
  margin: var(--spacing-2xl) 0;
  border-radius: var(--radius-md);
}

.app-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-text h3 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
}

.app-text p {
  font-size: var(--font-size-sm);
  margin: 0;
  opacity: 0.9;
}

.app-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.app-button {
  display: block;
  transition: transform var(--transition-normal);
}

.app-button:hover {
  transform: scale(1.05);
}

.app-button img {
  height: 40px;
  width: auto;
  border-radius: var(--radius-sm);
}

.footer-bottom {
  border-top: 1px solid var(--border-light);
  padding: var(--spacing-lg) 0;
  background: var(--bg-tertiary);
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
}

.footer-bottom-left {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-bottom-links {
  display: flex;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.footer-bottom-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color var(--transition-normal);
}

.footer-bottom-links a:hover {
  color: var(--primary-color);
}

.footer-bottom-right {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.language-selector,
.currency-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

.language-selector i,
.currency-selector i {
  color: var(--primary-color);
  font-size: var(--font-size-sm);
}

.language-selector select,
.currency-selector select {
  background: transparent;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  cursor: pointer;
}

.language-selector select:focus,
.currency-selector select:focus {
  outline: none;
  border-color: var(--primary-color);
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--spacing-xl);
  }
  
  .company-section {
    grid-column: 1 / -1;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: var(--spacing-2xl) 0 0;
  }
  
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
  }
  
  .company-section {
    grid-column: 1 / -1;
  }
  
  .app-content {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }
  
  .app-buttons {
    justify-content: center;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .footer-bottom-links {
    justify-content: center;
    gap: var(--spacing-md);
  }
  
  .footer-bottom-right {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .app-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .footer-bottom-links {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}
</style>
