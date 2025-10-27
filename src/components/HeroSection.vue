<template>
  <section class="hero">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="hero-title-text">Ask Anything</span>
        </h1>
        
        <div class="prompt-container" style="max-width: 900px !important; width: 900px !important;">
          <div class="prompt-bar" style="width: 900px !important; max-width: 900px !important; display: flex !important;">
            <i class="fas fa-robot" style="flex-shrink: 0 !important;"></i>
            <input 
              type="text" 
              placeholder="Ask our AI: 'Plan a 5-day trip to Japan' or 'Find itineraries for families with kids'"
              v-model="prompt"
              @input="handleInput"
              @focus="showSuggestions = true"
              @blur="hideSuggestions"
              style="flex: 1 !important; min-width: 0 !important; width: 100% !important;"
            >
            <button class="prompt-btn" @click="handleSubmit" :disabled="!prompt.trim()" style="flex-shrink: 0 !important;">
              Search
            </button>
          </div>
          
          <!-- AI Suggestions -->
          <div class="suggestions" v-if="showSuggestions && suggestions.length > 0">
            <div class="suggestion-category" v-for="category in suggestions" :key="category.type">
              <h4>{{ category.title }}</h4>
              <div class="suggestion-items">
                <button 
                  v-for="suggestion in category.items" 
                  :key="suggestion"
                  class="suggestion-item"
                  @click="selectSuggestion(suggestion)"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
            
            <!-- Live Results Preview -->
            <div class="results-preview" v-if="liveResults.length > 0">
              <h4>Live Results</h4>
              <div class="result-items">
                <div 
                  v-for="result in liveResults.slice(0, 3)" 
                  :key="result.id"
                  class="result-item"
                  @click="selectResult(result)"
                >
                  <div class="result-image">
                    <img :src="result.image" :alt="result.title" />
                  </div>
                  <div class="result-content">
                    <h5>{{ result.title }}</h5>
                    <p>{{ result.description }}</p>
                    <div class="result-meta">
                      <span class="result-type">{{ result.type }}</span>
                      <span class="result-rating" v-if="result.rating">
                        <i class="fas fa-star"></i>
                        {{ result.rating }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="hero-features">
          <div class="feature">
            <i class="fas fa-bolt"></i>
            <span>AI-Powered</span>
          </div>
          <div class="feature">
            <i class="fas fa-users"></i>
            <span>Creator Itineraries</span>
          </div>
          <div class="feature">
            <i class="fas fa-code-branch"></i>
            <span>Fork & Customize Plans</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HeroSection',
  data() {
    return {
      prompt: '',
      showSuggestions: false,
      suggestions: [],
      liveResults: [],
      dummyData: {
        itineraries: [
          {
            id: 1,
            title: "Tokyo 5-Day Adventure",
            description: "Complete itinerary covering temples, food tours, and modern districts",
            type: "Creator Itinerary",
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=80&h=60&fit=crop",
            creator: "TravelPro_Mike",
            days: 5,
            price: "Budget-friendly"
          },
          {
            id: 2,
            title: "Paris Romantic Getaway",
            description: "Perfect for couples - museums, cafes, and Seine river cruise",
            type: "Creator Itinerary",
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=80&h=60&fit=crop",
            creator: "ParisExplorer",
            days: 3,
            price: "Mid-range"
          },
          {
            id: 3,
            title: "Iceland Ring Road Adventure",
            description: "Epic 10-day road trip covering waterfalls, glaciers, and northern lights",
            type: "Creator Itinerary",
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=80&h=60&fit=crop",
            creator: "AdventureSeeker",
            days: 10,
            price: "Premium"
          }
        ],
        destinations: [
          {
            id: 4,
            title: "Kyoto, Japan",
            description: "Traditional temples, bamboo groves, and authentic cuisine",
            type: "Destination",
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=80&h=60&fit=crop",
            highlights: ["Temples", "Bamboo Forest", "Geisha District"]
          },
          {
            id: 5,
            title: "Santorini, Greece",
            description: "Stunning sunsets, white-washed buildings, and volcanic beaches",
            type: "Destination",
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=80&h=60&fit=crop",
            highlights: ["Sunset Views", "Wine Tasting", "Beaches"]
          }
        ],
        activities: [
          {
            id: 6,
            title: "Tokyo Food Tour",
            description: "Explore local markets and taste authentic Japanese cuisine",
            type: "Activity",
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=80&h=60&fit=crop",
            duration: "3 hours",
            price: "$45"
          },
          {
            id: 7,
            title: "Louvre Museum Private Tour",
            description: "Skip-the-line access with expert art historian guide",
            type: "Activity",
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=80&h=60&fit=crop",
            duration: "2 hours",
            price: "$89"
          }
        ],
        accommodations: [
          {
            id: 8,
            title: "Traditional Ryokan in Kyoto",
            description: "Authentic Japanese inn with tatami rooms and kaiseki meals",
            type: "Accommodation",
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=80&h=60&fit=crop",
            price: "$180/night",
            amenities: ["Onsen", "Kaiseki", "Tatami"]
          }
        ]
      }
    }
  },
  methods: {
    handleInput() {
      console.log('Input changed:', this.prompt)
      if (this.prompt.trim().length > 2) {
        this.generateSuggestions()
        this.generateLiveResults()
        console.log('Suggestions:', this.suggestions)
        console.log('Live results:', this.liveResults)
      } else {
        this.suggestions = []
        this.liveResults = []
      }
    },
    
    generateSuggestions() {
      const query = this.prompt.toLowerCase()
      
      // AI-powered suggestions based on content types
      this.suggestions = []
      
      // Always show general suggestions
      this.suggestions.push({
        type: 'general',
        title: 'Quick Suggestions',
        items: [
          'Plan a trip to ' + (query || 'your destination'),
          'Find itineraries for families',
          'Budget travel options',
          'Solo traveler guides'
        ]
      })
      
      // Destination suggestions
      if (query.includes('trip') || query.includes('travel') || query.includes('visit') || query.length > 0) {
        this.suggestions.push({
          type: 'destinations',
          title: 'Popular Destinations',
          items: [
            'Plan a 5-day trip to Japan',
            'Weekend getaway to Paris',
            'Adventure trip to Iceland',
            'Cultural tour of Italy'
          ]
        })
      }
      
      // Itinerary suggestions
      if (query.includes('itinerary') || query.includes('plan') || query.includes('schedule') || query.length > 0) {
        this.suggestions.push({
          type: 'itineraries',
          title: 'Creator Itineraries',
          items: [
            'Find itineraries for families with kids',
            'Solo traveler itineraries',
            'Budget-friendly trip plans',
            'Luxury travel experiences'
          ]
        })
      }
      
      // Activity suggestions
      if (query.includes('do') || query.includes('activity') || query.includes('experience') || query.length > 0) {
        this.suggestions.push({
          type: 'activities',
          title: 'Activities & Experiences',
          items: [
            'Food tours and cooking classes',
            'Outdoor adventures and hiking',
            'Museum and cultural visits',
            'Nightlife and entertainment'
          ]
        })
      }
      
      // Accommodation suggestions
      if (query.includes('stay') || query.includes('hotel') || query.includes('accommodation') || query.length > 0) {
        this.suggestions.push({
          type: 'accommodations',
          title: 'Where to Stay',
          items: [
            'Budget-friendly accommodations',
            'Luxury hotels and resorts',
            'Unique stays and boutique hotels',
            'Vacation rentals and apartments'
          ]
        })
      }
      
      // Transportation suggestions
      if (query.includes('transport') || query.includes('flight') || query.includes('travel') || query.length > 0) {
        this.suggestions.push({
          type: 'transport',
          title: 'Transportation',
          items: [
            'Flight booking and deals',
            'Local transportation options',
            'Car rental and road trips',
            'Public transport guides'
          ]
        })
      }
      
      // Budget suggestions
      if (query.includes('budget') || query.includes('cost') || query.includes('price') || query.length > 0) {
        this.suggestions.push({
          type: 'budget',
          title: 'Budget Planning',
          items: [
            'Budget breakdown for destinations',
            'Money-saving travel tips',
            'Free activities and attractions',
            'Cost-effective dining options'
          ]
        })
      }
    },
    
    generateLiveResults() {
      const query = this.prompt.toLowerCase()
      this.liveResults = []
      
      // Search through dummy data based on query
      const allData = [
        ...this.dummyData.itineraries,
        ...this.dummyData.destinations,
        ...this.dummyData.activities,
        ...this.dummyData.accommodations
      ]
      
      // Add contextual results based on keywords
      if (query.includes('japan') || query.includes('tokyo')) {
        this.liveResults.push(...this.dummyData.itineraries.filter(item => 
          item.title.toLowerCase().includes('tokyo') || 
          item.title.toLowerCase().includes('japan')
        ))
        this.liveResults.push(...this.dummyData.destinations.filter(item => 
          item.title.toLowerCase().includes('kyoto')
        ))
        this.liveResults.push(...this.dummyData.activities.filter(item => 
          item.title.toLowerCase().includes('tokyo')
        ))
      }
      
      if (query.includes('paris') || query.includes('france')) {
        this.liveResults.push(...this.dummyData.itineraries.filter(item => 
          item.title.toLowerCase().includes('paris')
        ))
        this.liveResults.push(...this.dummyData.activities.filter(item => 
          item.title.toLowerCase().includes('louvre')
        ))
      }
      
      if (query.includes('iceland')) {
        this.liveResults.push(...this.dummyData.itineraries.filter(item => 
          item.title.toLowerCase().includes('iceland')
        ))
      }
      
      // If no specific matches, show general filtered results
      if (this.liveResults.length === 0) {
        const filteredResults = allData.filter(item => {
          const searchText = `${item.title} ${item.description} ${item.type}`.toLowerCase()
          return searchText.includes(query)
        })
        this.liveResults = filteredResults.slice(0, 3)
      }
      
      // Remove duplicates and limit to 3 results
      this.liveResults = this.liveResults.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      ).slice(0, 3)
      
      console.log('Live results for query "' + query + '":', this.liveResults)
    },
    
    selectSuggestion(suggestion) {
      this.prompt = suggestion
      this.showSuggestions = false
      this.handleSubmit()
    },
    
    selectResult(result) {
      this.prompt = `Show me more about "${result.title}"`
      this.showSuggestions = false
      console.log('Selected result:', result)
      // TODO: Navigate to result detail page
    },
    
    handleSubmit() {
      if (this.prompt.trim()) {
        console.log('AI Prompt submitted:', this.prompt)
        // TODO: Integrate with AI backend
        this.showSuggestions = false
      }
    },
    
    hideSuggestions() {
      // Delay hiding to allow clicking on suggestions
      setTimeout(() => {
        this.showSuggestions = false
      }, 200)
    }
  }
}
</script>

<style>
.hero .container {
  max-width: 1400px !important;
}
</style>

<style scoped>
.hero {
  background: #ffffff;
  padding: 80px 0;
  min-height: 400px;
  display: flex;
  align-items: center;
}

.hero-content {
  text-align: center;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  line-height: 1.2;
  color: #0f172a;
}

.hero-subtitle {
  display: block;
  font-size: 20px;
  font-weight: 400;
  margin-top: 8px;
  color: #475569;
}

.prompt-container {
  position: relative;
  margin-bottom: 40px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.prompt-bar {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  padding: 8px 8px 8px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  width: 100%;
  margin: 0 auto;
}

.prompt-bar:focus-within {
  border-color: #d1d5db;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.prompt-bar i {
  color: #9cafa9;
  margin-right: 16px;
  font-size: 20px;
}

.prompt-bar input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  font-size: 16px;
  color: #1f2937;
  font-weight: 400;
}

.prompt-bar input::placeholder {
  color: #9ca3af;
}

.prompt-btn {
  background: #10b981;
  border: none;
  border-radius: 50px;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 12px;
  font-weight: 600;
  font-size: 16px;
  color: #000000;
  min-width: 120px;
}

.prompt-btn:hover:not(:disabled) {
  background: #059669;
  transform: scale(1.02);
}

.prompt-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
  color: #6b7280;
}

.prompt-btn i {
  color: #000000;
  font-size: 16px;
  margin: 0;
  display: none;
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  padding: 20px;
  margin-top: 8px;
  width: 900px;
  max-width: 900px;
  z-index: 1000;
}

.suggestion-category {
  margin-bottom: 20px;
}

.suggestion-category:last-child {
  margin-bottom: 0;
}

.suggestion-category h4 {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.suggestion-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.suggestion-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #475569;
}

.suggestion-item:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.results-preview {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.results-preview h4 {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.result-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.result-item:hover {
  background: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.result-image {
  width: 60px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.result-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-content h5 {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-content p {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-type {
  background: #3b82f6;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
}

.result-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: #64748b;
}

.result-rating i {
  color: #fbbf24;
  font-size: 10px;
}

.hero-features {
  display: flex;
  justify-content: center;
  gap: 48px;
}

.feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #64748b;
}

.feature i {
  font-size: 20px;
  color: #10b981;
}

@media (max-width: 768px) {
  .hero {
    padding: 60px 0;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .prompt-bar {
    padding: 12px 16px;
    margin: 0 16px;
  }
  
  .prompt-bar input {
    font-size: 14px;
  }
  
  .suggestions {
    left: 16px;
    right: 16px;
    transform: none;
    min-width: auto;
  }
  
  .suggestion-items {
    grid-template-columns: 1fr;
  }
  
  .hero-features {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
