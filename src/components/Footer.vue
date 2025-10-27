<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Company Info -->
        <div class="footer-section">
          <div class="footer-logo">
            <img src="/logo.svg" alt="my3pai.com Logo" class="footer-logo-image" />
            <span>my3pai.com</span>
          </div>
          <p class="footer-description">
            Your trusted companion for discovering amazing destinations around the world. 
            We help you plan unforgettable trips with confidence.
          </p>
          <div class="social-links">
            <a href="#" class="social-link">
              <i class="fab fa-facebook"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-link">
              <i class="fab fa-youtube"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><a href="#">About Us</a></li>
            <li><a href="#">Contact</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Press</a></li>
            <li><a href="#">Blog</a></li>
          </ul>
        </div>

        <!-- Travel Services -->
        <div class="footer-section">
          <h4>Travel Services</h4>
          <ul class="footer-links">
            <li><a href="#">Hotels</a></li>
            <li><a href="#">Flights</a></li>
            <li><a href="#">Vacation Rentals</a></li>
            <li><a href="#">Car Rentals</a></li>
            <li><a href="#">Travel Insurance</a></li>
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
          </ul>
        </div>

        <!-- Newsletter -->
        <div class="footer-section">
          <h4>Stay Updated</h4>
          <p>Get the latest travel deals and destination guides</p>
          <div class="newsletter-form">
            <input 
              type="email" 
              placeholder="Enter your email" 
              v-model="email"
            >
            <button class="btn btn-primary" @click="subscribeNewsletter">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p>&copy; 2024 TravelHub. All rights reserved.</p>
          <div class="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
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
  background: #1e293b;
  color: white;
  padding: 60px 0 0;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-section h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: white;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 16px;
}

.footer-logo-image {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.footer-description {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 24px;
}

.social-links {
  display: flex;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: #334155;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.footer-links {
  list-style: none;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.newsletter-form {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.newsletter-form input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #475569;
  border-radius: 8px;
  background: #334155;
  color: white;
  outline: none;
}

.newsletter-form input::placeholder {
  color: #94a3b8;
}

.newsletter-form input:focus {
  border-color: #667eea;
}

.footer-bottom {
  border-top: 1px solid #334155;
  padding: 24px 0;
}

.footer-bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #94a3b8;
}

.footer-bottom-links {
  display: flex;
  gap: 24px;
}

.footer-bottom-links a {
  color: #94a3b8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-bottom-links a:hover {
  color: white;
}

@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}

@media (max-width: 768px) {
  .footer {
    padding: 40px 0 0;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .footer-bottom-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .footer-bottom-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }
  
  .newsletter-form {
    flex-direction: column;
  }
}
</style>
