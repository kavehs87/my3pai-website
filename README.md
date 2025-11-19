# my3pai.com - AI-Powered Travel Planning Platform

A modern travel website built with Vue.js, featuring AI-powered travel planning, creator itineraries, and video content discovery. This project uses dummy data and is designed to be easily integrated with a Node.js or PHP Laravel backend in the future.

## 🌟 Key Features

### 🤖 AI-Powered Travel Planning
- **Smart Prompt Bar** - Ask our AI to help plan your perfect trip
- **Live Suggestions** - Real-time suggestions as you type
- **Intelligent Results** - AI-generated travel recommendations
- **Dynamic Search** - Context-aware search across all content types

### 👥 Creator Economy
- **Popular Creators** - Discover top travel content creators
- **Creator Profiles** - View creator stats, specialties, and featured content
- **Verified Badges** - Trust indicators for quality creators
- **Follow System** - Connect with your favorite travel creators

### 📹 Video Content Discovery
- **Video Plans** - YouTube shorts, Instagram reels, and TikTok videos
- **Two Display Styles** - Grid layout and vertical shorts/reels format
- **Auto-play Videos** - Engaging video content with intersection observer
- **Clone & Customize** - Fork creator itineraries into your own trips

### 🎯 Content Categories
- **Destinations** - Popular travel destinations with ratings
- **Hotels** - Featured accommodations with amenities
- **Restaurants** - Dining experiences with cuisine types
- **Attractions** - Things to do and popular spots

### 📱 Responsive Design
- **Mobile-First** - Optimized for all screen sizes
- **Touch-Friendly** - Intuitive mobile navigation
- **Progressive Enhancement** - Works on all devices
- **Modern UI/UX** - Clean, professional design

## 🛠️ Tech Stack

- **Frontend**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Styling**: CSS3 with CSS Custom Properties
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)
- **State Management**: Vue 3 Composition API
- **Routing**: Vue Router 4

## 📁 Project Structure

```
src/
├── components/
│   ├── Header.vue              # Navigation with mobile menu
│   ├── HeroSection.vue         # AI prompt bar with suggestions
│   ├── VideoPlans.vue          # Grid layout video content
│   ├── VideoShorts.vue         # Vertical shorts/reels format
│   ├── CTA.vue                 # Call-to-action section
│   ├── Footer.vue              # Footer with links and newsletter
│   └── Home.vue                # Main page orchestrator
├── data/
│   ├── dummyData.js            # Legacy mock data
│   └── plans.json              # Video content data
├── App.vue                     # Root component
├── main.js                     # App entry point
└── style.css                   # Global styles with CSS variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my3pai-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the website.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📊 Data Structure

### Video Plans (`plans.json`)
- **Platform**: YouTube, Instagram, TikTok
- **Content**: Title, description, video URL, thumbnail
- **Creator Info**: Name, avatar, stats
- **Metadata**: Difficulty, budget, tags, duration

### Creator Profiles (Profile API)
- **Endpoint**: `GET /api/profile` (see `docs/Profile_api.md`)
- **Profile**: Display name, username, avatar, cover image, bio, tier, specialties
- **Stats**: Followers, following, total plans, total views, total likes
- **Content**: Featured plan, recent plans, partnerships, social links
- **Misc**: Countries visited, languages, preferences

## 🎨 Design System

### CSS Custom Properties
The project uses a centralized design system with CSS variables:

```css
:root {
  /* Colors */
  --primary-color: #00a651;      /* TripAdvisor Green */
  --secondary-color: #10b981;    /* Emerald */
  --accent-color: #667eea;       /* Blue */
  
  /* Typography */
  --font-family: 'Inter', sans-serif;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 18px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
  --font-size-4xl: 36px;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 40px;
  --spacing-3xl: 60px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 50px;
}
```

## 🔧 Key Components

### HeroSection
- **AI Prompt Bar** - Main search interface
- **Live Suggestions** - Real-time content suggestions
- **Results Preview** - Dynamic search results
- **Responsive Design** - Mobile-optimized layout

### VideoPlans
- **Grid Layout** - Card-based video display
- **Platform Badges** - YouTube, Instagram, TikTok indicators
- **Creator Info** - Creator name, avatar, stats
- **Clone & Customize** - Action button for forking content

### VideoShorts
- **Vertical Layout** - Mobile-first shorts format
- **Auto-play** - Intersection observer for video playback
- **Swipe Navigation** - Touch-friendly interactions
- **Full-screen Support** - Immersive viewing experience

## 🔮 Future Backend Integration

### Node.js/Express Backend
- Replace dummy data with API calls
- Implement real-time suggestions
- Add user authentication
- Integrate with AI services

### PHP Laravel Backend
- Similar API integration approach
- Laravel Sanctum for authentication
- Proper CORS handling
- Database integration

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚀 Next Steps

1. **Backend Integration** - Replace dummy data with real API calls
2. **AI Integration** - Connect to OpenAI or similar AI services
3. **User Authentication** - Add login/signup functionality
4. **Content Management** - Creator dashboard for uploading content
5. **Payment System** - Monetization for creators
6. **Advanced Search** - Filters for content type, difficulty, budget
7. **Social Features** - Comments, likes, sharing
8. **Mobile App** - React Native or Flutter implementation

## 📝 Recent Updates

- ✅ **AI-Powered Search** - Smart prompt bar with live suggestions
- ✅ **Video Content** - Two display formats for video plans
- ✅ **Responsive Design** - Mobile-optimized layouts
- ✅ **CSS Variables** - Centralized design system
- ✅ **Image Fallbacks** - Reliable avatar system with SVG data URIs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

---

Built with ❤️ using Vue.js and modern web technologies