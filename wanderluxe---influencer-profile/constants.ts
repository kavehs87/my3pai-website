

import { Tour, Product, Country, PodcastEpisode, BlogPost, MediaAsset, ExternalPlatformLink } from './types';

export const PROFILE = {
  name: "Monika Klenowska",
  handle: "@swissoutside",
  tagline: "Mountain and lake routes specialist",
  location: "Based in Switzerland",
  subLocation: "Lives in Bern",
  // New specific bio text
  bio: `My journey into the heart of Switzerland began not as a seasoned traveler, but as a curious explorer enchanted by the tales of alpine wonders. What started as weekend escapes from city life soon became a full passion for discovering and documenting the most breathtaking spots this country has to offer.

I specialize in crafting experiences that balance iconic sights with hidden gems. My focus is on scenic lake walks, panoramic train journeys, and family friendly hikes that are accessible yet deeply rewarding. I believe in creating memories that last, not just checklists of places to see.

My philosophy is rooted in realistic planning, honest cost estimates, and a deep respect for nature. Every point of interest I share is carefully researched so you can enjoy a seamless, safe, and sustainable adventure.`,
  stats: {
    rating: 4.9,
    reviews: 72,
    locations: 237,
    mapsBuilt: 12,
    travelersGuided: "1,450"
  },
  socials: [
    { platform: 'Instagram', url: '#', handle: '@swissoutside' },
    { platform: 'YouTube', url: '#', handle: 'Monika Travels' },
    { platform: 'TikTok', url: '#', handle: '@swiss_monika' }
  ],
  languages: [
    { name: "English", level: "Fluent", flag: "🇬🇧" },
    { name: "German", level: "Fluent", flag: "🇩🇪" },
    { name: "French", level: "Conversational", flag: "🇫🇷" },
    { name: "Polish", level: "Native", flag: "🇵🇱" },
    { name: "Italian", level: "Conversational", flag: "🇮🇹" }
  ],
  image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80",
  
  // New Skills List from screenshot
  skills: [
    "Itinerary Design",
    "Budget Planning",
    "Train Connections",
    "Risk Awareness",
    "Family Travel Planning",
    "Photo Spot Scouting"
  ],
  
  // New Certifications from screenshot
  certifications: [
    "Verified Local Expert",
    "Certified Hiking Guide",
    "Airbnb Superhost",
    "TripAdvisor Excellence",
    "First Aid Trained",
    "Sustainability Aware Routes"
  ],

  reviews: [
    {
      id: 1,
      text: "Monika planned the most incredible 2-week trip for us. Every restaurant recommendation was spot on!",
      author: "Sarah Jenkins",
      role: "Solo Traveler"
    }
  ]
};

export const TOURS: Tour[] = [
  { id: '1', name: 'Kyoto Hidden Alleys', type: 'City' },
  { id: '2', name: 'Iceland Ring Road', type: 'Photo' },
  { id: '3', name: 'Patagonia Trek', type: 'Hiking' },
  { id: '4', name: 'Vietnam Street Food', type: 'Food' },
];

// Separated Data Categories

export const CONSULTATION: Product = {
  id: 'p3',
  title: '1-on-1 Trip Planning',
  description: '60-minute video call to plan your dream vacation with personalized advice.',
  price: 150,
  type: 'Consulting',
  image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80'
};

export const ITINERARIES: Product[] = [
  {
    id: 'p1',
    title: 'Complete Japan Itinerary',
    description: 'A 14-day step-by-step guide to the best of Japan, including rail pass tips.',
    price: 29,
    discount: '20% OFF',
    type: 'Itinerary',
    image: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p4',
    title: 'Patagonia Trekking Guide',
    description: 'The ultimate route map, gear list, and refugio booking guide for hikers.',
    price: 35,
    type: 'Itinerary',
    image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p6',
    title: 'Amalfi Coast Road Trip',
    description: '7-day itinerary through Positano, Amalfi, and Ravello with hotel picks.',
    price: 25,
    discount: 'HOT',
    type: 'Itinerary',
    image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80'
  }
];

export const MASTERCLASSES: Product[] = [
  {
    id: 'p2',
    title: 'Photography Masterclass',
    description: 'Learn how to edit your travel photos like a pro using Lightroom.',
    price: 49,
    type: 'Guide',
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'p5',
    title: 'Become a Travel Creator',
    description: 'From zero followers to your first brand deal: a comprehensive course.',
    price: 199,
    type: 'Guide',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
  }
];

export const PACKAGES: Product[] = [
  CONSULTATION,
  ...ITINERARIES,
  ...MASTERCLASSES
];

export const EXTERNAL_LINKS: ExternalPlatformLink[] = [
  {
    id: 'e1',
    platform: 'GetYourGuide',
    title: 'Certified Guide',
    subtitle: 'Book my official tours',
    url: '#',
    rating: 4.9
  },
  {
    id: 'e2',
    platform: 'Airbnb',
    title: 'Superhost',
    subtitle: 'Stay at my guest house',
    url: '#',
    rating: 5.0
  }
];

export const FEATURED_ACCOMMODATION = {
  title: "Traditional Machiya House",
  location: "Kyoto, Japan",
  image: "https://images.unsplash.com/photo-1493936734716-77ba6da66365?auto=format&fit=crop&w=400&q=80",
  rating: 4.96,
  reviews: 185
};

export const COUNTRIES: Country[] = [
  {
    id: 'c1',
    name: 'Iceland',
    flagCode: 'IS',
    pointsOfInterestCount: 124,
    description: "Land of fire and ice, featuring dramatic waterfalls and glaciers.",
    image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=800&q=80',
    mapPrice: 15,
    pois: [
      { name: 'Diamond Beach', tags: ['photo spot', 'nature'] },
      { name: 'Skógafoss', tags: ['waterfall', 'crowded'] },
      { name: 'Westfjords Hot Pots', tags: ['hidden gem', 'relax'] }
    ]
  },
  {
    id: 'c2',
    name: 'Japan',
    flagCode: 'JP',
    pointsOfInterestCount: 340,
    description: "Ancient tradition meets neon future in this cultural powerhouse.",
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    mapPrice: 20,
    mapDiscount: "BESTSELLER",
    pois: [
      { name: 'Fushimi Inari at Night', tags: ['photo spot', 'spooky'] },
      { name: 'Omoide Yokocho', tags: ['food', 'culture'] },
      { name: 'Nara Park', tags: ['family friendly', 'nature'] }
    ]
  },
  {
    id: 'c3',
    name: 'Morocco',
    flagCode: 'MA',
    pointsOfInterestCount: 85,
    description: "Vibrant colors, endless deserts, and bustling historic medinas.",
    image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80',
    mapPrice: 12,
    pois: [
      { name: 'Chefchaouen Blue City', tags: ['photo spot'] },
      { name: 'Sahara Desert Camp', tags: ['adventure', 'stars'] }
    ]
  },
    {
    id: 'c4',
    name: 'Italy',
    flagCode: 'IT',
    pointsOfInterestCount: 210,
    description: "The heart of art, history, and world-renowned culinary delights.",
    image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
    mapPrice: 18,
    mapDiscount: "NEW",
    pois: [
      { name: 'Cinque Terre', tags: ['hiking', 'views'] },
      { name: 'Hidden Venice Canals', tags: ['romantic', 'quiet'] }
    ]
  }
];

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: 'ep1',
    title: 'Solo Female Travel Tips',
    description: 'How to stay safe and make friends while traveling alone.',
    duration: '45 min',
    isPremium: false,
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'ep2',
    title: 'Monetizing Your Travel Blog',
    description: 'Deep dive into affiliate marketing and brand deals.',
    duration: '62 min',
    isPremium: true,
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=400&q=80'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'b1',
    title: '10 Hidden Gems in Kyoto',
    preview: 'Forget the crowded temples, here are the spots only locals know about...',
    date: 'Oct 12, 2023',
    isPremium: false,
    image: 'https://images.unsplash.com/photo-1558862107-d49ef2a04d72?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'b2',
    title: 'My Exact Gear List 2024',
    preview: 'Every camera, lens, and backpack I use for professional shoots.',
    date: 'Nov 01, 2023',
    isPremium: true,
    image: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&w=800&q=80'
  }
];

export const MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'm1',
    title: 'Cinematic Drone LUTs',
    description: 'Pack of 10 color grading presets for DJI drones.',
    type: 'Preset',
    price: 25,
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm2',
    title: 'Iceland 4K Stock Footage',
    description: '10 minutes of uncolored raw footage for creators.',
    type: 'Video',
    price: 120,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'm3',
    title: 'Tokyo Street Preset',
    description: 'Moody urban tones for night photography.',
    type: 'Preset',
    price: 15,
    image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'
  }
];

export const YOUTUBE_VIDEOS = [
    {
        id: 'y1',
        title: 'Hiking the Swiss Alps: Ultimate Guide',
        image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
        views: '125K',
        duration: '14:20'
    },
    {
        id: 'y2',
        title: 'My Camera Gear for Solo Travel',
        image: 'https://images.unsplash.com/photo-1500634245200-e5245c7574ef?auto=format&fit=crop&w=800&q=80',
        views: '45K',
        duration: '08:45'
    }
];

export const SHORT_FORM_CONTENT = [
    {
        id: 'r1',
        platform: 'Instagram',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
        views: '12K',
        caption: 'Morning views ☕️'
    },
    {
        id: 'r2',
        platform: 'TikTok',
        image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=400&q=80',
        views: '8.5K',
        caption: 'Hidden waterfall 💦'
    },
    {
        id: 'r3',
        platform: 'Instagram',
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80',
        views: '45K',
        caption: 'Swiss village life'
    },
    {
        id: 'r4',
        platform: 'Facebook',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
        views: '2.1K',
        caption: 'Beach sunset vibes'
    }
];
