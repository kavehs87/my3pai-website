# my3pai.com - Travel Website Mockup

A modern travel website mockup built with Vue.js, similar to TripAdvisor. This project uses dummy data and is designed to be easily integrated with a Node.js or PHP Laravel backend in the future.

## Features

- 🏨 **Hotels** - Browse and search hotels with ratings and amenities
- 🍽️ **Restaurants** - Discover dining experiences with cuisine types
- 🎯 **Attractions** - Find things to do and popular destinations
- 🌍 **Destinations** - Explore popular travel destinations worldwide
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔍 **Search Functionality** - Search by destination, dates, and preferences
- ⭐ **Ratings & Reviews** - Star ratings and review counts for all listings

## Tech Stack

- **Frontend**: Vue.js 3 with Composition API
- **Build Tool**: Vite
- **Styling**: CSS3 with modern features (Grid, Flexbox, CSS Variables)
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Project Structure

```
src/
├── components/
│   ├── Header.vue          # Navigation and search
│   ├── HeroSection.vue     # Hero banner with search form
│   ├── DestinationCard.vue # Destination card component
│   ├── CategoriesSection.vue # Category grid
│   ├── Footer.vue          # Footer with links and newsletter
│   └── Home.vue            # Main page component
├── data/
│   └── dummyData.js        # Mock data for destinations, hotels, etc.
├── App.vue                 # Root component
├── main.js                 # App entry point
└── style.css               # Global styles
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   cd /Users/kaveh/Documents/Projects/my3pai/website
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
   Navigate to `http://localhost:3000` to view the website.

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Dummy Data Structure

The project includes comprehensive dummy data for:

- **Destinations**: 6 popular travel destinations with images, ratings, and highlights
- **Hotels**: 3 featured hotels with amenities and pricing
- **Restaurants**: 3 restaurants with cuisine types and ratings
- **Attractions**: 3 popular attractions with categories and duration

## Future Backend Integration

This frontend is designed to easily integrate with:

### Node.js/Express Backend
- Replace dummy data imports with API calls
- Use axios or fetch for HTTP requests
- Implement proper error handling and loading states

### PHP Laravel Backend
- Similar API integration approach
- Consider using Laravel Sanctum for authentication
- Implement proper CORS handling

## Key Components Explained

### Header Component
- Responsive navigation with mobile menu
- Search functionality with different tabs
- User actions (saved items, sign in)

### Hero Section
- Dynamic search form with multiple tabs
- Date pickers for hotel searches
- Guest selection dropdown

### Destination Cards
- Image hover effects
- Star ratings with review counts
- Save functionality
- Price indicators

### Categories Section
- Grid layout with hover animations
- Icon overlays on hover
- Statistics display

## Customization

### Colors
The project uses CSS custom properties for easy theming:
- Primary: `#667eea` (Purple gradient)
- Secondary: `#764ba2` (Darker purple)
- Text: `#1e293b` (Dark gray)
- Background: `#f8fafc` (Light gray)

### Fonts
- Primary: Inter (Google Fonts)
- Icons: Font Awesome 6

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Next Steps

1. **Backend Integration**: Replace dummy data with real API calls
2. **Authentication**: Add user login/signup functionality
3. **Booking System**: Implement reservation and payment flows
4. **Advanced Search**: Add filters for price, rating, amenities
5. **User Reviews**: Allow users to write and manage reviews
6. **Maps Integration**: Add interactive maps for locations
7. **Mobile App**: Consider React Native or Flutter for mobile

---

Built with ❤️ using Vue.js
