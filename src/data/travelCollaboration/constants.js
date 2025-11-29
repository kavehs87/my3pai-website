



export const MOCK_USER = {
  id: 'u1',
  name: 'Alex Chen',
  handle: '@alextravels',
  avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop&q=60',
  isVerified: true,
  role: 'creator',
  stats: {
    rating: 4.9,
    reviewCount: 42
  }
};

export const MOCK_CREATORS = [
  {
    id: 'cr1',
    name: 'Sofia Davis',
    handle: '@sofia.visuals',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=60',
    coverUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop&q=60',
    bio: 'Travel & Lifestyle photographer capturing the unseen moments. Open for brand collaborations in Asia.',
    location: 'Tokyo, Japan',
    coords: [35.6600, 139.7050], // Near Shibuya
    tags: ['Travel', 'Lifestyle', 'Fashion'],
    metrics: {
      followers: '125K',
      engagement: '4.2%',
      avgLikes: '8.5K'
    },
    isVerified: true,
    platforms: ['Instagram', 'TikTok'],
    availability: { status: 'AVAILABLE' },
    portfolio: [
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=200&h=200&fit=crop'
    ]
  },
  {
    id: 'cr2',
    name: 'Marcus Chen',
    handle: '@marcus_eats',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=60',
    coverUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=60',
    bio: 'Food vlogger hunting for the best street food and hidden gems. Let’s eat!',
    location: 'Osaka, Japan',
    coords: [35.6900, 139.7000], // Near Shinjuku
    tags: ['Food', 'Vlog', 'Review'],
    metrics: {
      followers: '450K',
      engagement: '5.8%',
      avgLikes: '22K'
    },
    isVerified: true,
    platforms: ['YouTube', 'Instagram'],
    availability: { status: 'BOOKED', until: 'Nov 1' },
    portfolio: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200&h=200&fit=crop'
    ]
  },
  {
    id: 'cr3',
    name: 'Elara Vlogs',
    handle: '@elara_goes',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60',
    coverUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&auto=format&fit=crop&q=60',
    bio: 'Solo female travel tips and cinematic storytelling. Currently exploring Japan.',
    location: 'Kyoto, Japan',
    coords: [35.6800, 139.7600], // Near Tokyo Station
    tags: ['Travel', 'Cinematic', 'Solo Travel'],
    metrics: {
      followers: '85K',
      engagement: '6.1%',
      avgLikes: '5.2K'
    },
    isVerified: false,
    platforms: ['TikTok', 'YouTube'],
    availability: { status: 'AVAILABLE' },
    portfolio: [
      'https://images.unsplash.com/photo-1504150558240-0b4fd8946624?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=200&fit=crop'
    ]
  },
  {
    id: 'cr4',
    name: 'David Kim',
    handle: '@tech_nomad',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=60',
    coverUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60',
    bio: 'Reviewing tech for travelers. Digital nomad lifestyle and gear setup.',
    location: 'Tokyo, Japan',
    coords: [35.6300, 139.7800], // Near Odaiba
    tags: ['Tech', 'Gear', 'Nomad'],
    metrics: {
      followers: '210K',
      engagement: '3.5%',
      avgLikes: '7.8K'
    },
    isVerified: true,
    platforms: ['YouTube', 'Instagram'],
    availability: { status: 'BUSY' },
    portfolio: [
      'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1531297461136-82lw9b2b0326?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=200&h=200&fit=crop'
    ]
  }
];

export const MOCK_TRIPS = [
  {
    id: 't1',
    userId: 'u1',
    destination: {
      city: 'Tokyo',
      country: 'Japan',
      coordinates: [35.6580, 139.7016],
      radiusKm: 10
    },
    dates: {
      start: '2023-10-12',
      end: '2023-10-15'
    },
    status: 'active',
    intents: ['SOCIAL', 'CONTENT_CREATION'],
    userRole: 'creator'
  },
  {
    id: 't2',
    userId: 'u1',
    destination: {
      city: 'Seoul',
      country: 'South Korea',
      coordinates: [37.5665, 126.9780],
      radiusKm: 15
    },
    dates: {
      start: '2023-11-01',
      end: '2023-11-10'
    },
    status: 'upcoming',
    intents: ['WORK'],
    userRole: 'business'
  }
];

export const MOCK_OFFERS = [
  {
    id: 'o1',
    creatorId: 'u2',
    type: 'SESSION',
    title: 'Portrait Photography in Shibuya',
    description: '1 hour professional portrait session. Includes 15 edited photos. I know the best hidden spots in Shibuya crossing area.',
    price: { amount: 150, currency: 'USD', unit: 'fixed' },
    gearIncluded: ['Sony A7IV', '85mm G Master'],
    coords: [35.6595, 139.7005], // Near Shibuya
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=60', // Camera/Pro
    user: {
      name: 'Sarah Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=60',
      isVerified: true,
      stats: { rating: 5.0, reviewCount: 120 }
    }
  },
  {
    id: 'o2',
    creatorId: 'u3',
    type: 'SESSION',
    title: 'Cinematic Drone Shots',
    description: 'Get high quality 4K drone footage for your travel vlog. Fully licensed drone operator.',
    price: { amount: 200, currency: 'USD', unit: 'hourly' },
    gearIncluded: ['DJI Mavic 3 Cine'],
    coords: [35.6298, 139.7942], // Odaiba
    imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&auto=format&fit=crop&q=60', // Drone
    user: {
      name: 'Mike Ross',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=60',
      isVerified: true,
      stats: { rating: 4.8, reviewCount: 34 }
    }
  },
  {
    id: 'o7',
    creatorId: 'u8',
    type: 'SESSION',
    title: 'Sunrise Yoga in Shinjuku Gyoen',
    description: 'Start your day with mindfulness. 60-minute Vinyasa flow in the beautiful park gardens. Mats provided.',
    price: { amount: 25, currency: 'USD', unit: 'fixed' },
    gearIncluded: ['Yoga Mat', 'Water'],
    coords: [35.6852, 139.7100], // Shinjuku Gyoen
    imageUrl: 'https://images.unsplash.com/photo-1544367563-121955b2d63b?w=800&auto=format&fit=crop&q=60',
    user: {
      name: 'Emma Wilson',
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=60',
      isVerified: true,
      stats: { rating: 5.0, reviewCount: 89 }
    }
  },
  {
    id: 'o8',
    creatorId: 'u9',
    type: 'SESSION',
    title: 'Traditional Sushi Making Class',
    description: 'Learn to make authentic Edo-style sushi from a local chef. Includes market tour and lunch.',
    price: { amount: 80, currency: 'USD', unit: 'fixed' },
    gearIncluded: ['Apron', 'Ingredients'],
    coords: [35.6654, 139.7707], // Tsukiji
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=60',
    user: {
      name: 'Kenji Suzuki',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=60',
      isVerified: true,
      stats: { rating: 4.9, reviewCount: 150 }
    }
  },
  {
    id: 'o9',
    creatorId: 'u10',
    type: 'SESSION',
    title: 'Kamakura Surf Lesson',
    description: 'Beginner friendly surf lessons just an hour from Tokyo. Transport from station included.',
    price: { amount: 60, currency: 'USD', unit: 'hourly' },
    gearIncluded: ['Surfboard', 'Wetsuit'],
    coords: [35.3192, 139.5467], // Kamakura
    imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c70e0c6f?w=800&auto=format&fit=crop&q=60',
    user: {
      name: 'Kai Tanaka',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=60',
      isVerified: false,
      stats: { rating: 4.7, reviewCount: 42 }
    }
  },
  {
    id: 'o10',
    creatorId: 'u11',
    type: 'SESSION',
    title: 'Japanese Pottery Workshop',
    description: 'Create your own ceramic bowl or cup using traditional wheel throwing techniques. Shipping available.',
    price: { amount: 55, currency: 'USD', unit: 'fixed' },
    gearIncluded: ['Clay', 'Firing'],
    coords: [35.7100, 139.7900], // Asakusa
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a64b27876e9?w=800&auto=format&fit=crop&q=60',
    user: {
      name: 'Yuki Arts',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60',
      isVerified: true,
      stats: { rating: 4.9, reviewCount: 67 }
    }
  },
  {
    id: 'o11',
    creatorId: 'u12',
    type: 'SESSION',
    title: 'Calligraphy & Tea Ceremony',
    description: 'Experience the zen of Japanese calligraphy followed by a traditional matcha tea ceremony.',
    price: { amount: 45, currency: 'USD', unit: 'fixed' },
    gearIncluded: ['Brush', 'Ink', 'Kimono'],
    coords: [35.6764, 139.7690], // Ginza
    imageUrl: 'https://images.unsplash.com/photo-1533230626348-18e0078848dd?w=800&auto=format&fit=crop&q=60',
    user: {
      name: 'Sakura Studio',
      avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656ec?w=200&auto=format&fit=crop&q=60',
      isVerified: true,
      stats: { rating: 5.0, reviewCount: 112 }
    }
  },
  {
    id: 'o12',
    creatorId: 'u13',
    type: 'SESSION',
    title: 'Street Food Night Tour',
    description: 'Explore the best yakitori alleys and standing bars in Ueno. Includes 3 drinks and 5 dishes.',
    price: { amount: 70, currency: 'USD', unit: 'fixed' },
    gearIncluded: [],
    coords: [35.7141, 139.7741], // Ueno
    imageUrl: 'https://images.unsplash.com/photo-1580442451747-4595e3a536f5?w=800&auto=format&fit=crop&q=60',
    user: {
      name: 'Hiro Guides',
      avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&auto=format&fit=crop&q=60',
      isVerified: true,
      stats: { rating: 4.8, reviewCount: 203 }
    }
  },
  {
    id: 'o3',
    creatorId: 'u4',
    type: 'MEETUP',
    title: 'Coffee & Co-working',
    description: 'Looking for other digital nomads to co-work with for a few hours. No charge, just good vibes.',
    price: { amount: 0, currency: 'USD', unit: 'fixed' },
    gearIncluded: [],
    coords: [35.6413, 139.6981], // Nakameguro
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=60', // Personal Selfie/Portrait
    user: {
      name: 'Jessica Lee',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60',
      isVerified: false,
      stats: { rating: 4.5, reviewCount: 8 }
    },
    maxAttendees: 6,
    attendees: [
      { avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop' },
      { avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a3694c2d628?w=100&auto=format&fit=crop' },
      { avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop' }
    ]
  },
  {
    id: 'o4',
    creatorId: 'u5',
    type: 'SERVICE',
    title: 'Local Translation Help',
    description: 'I can help you navigate restaurant bookings and shopping for a half day.',
    price: { amount: 30, currency: 'USD', unit: 'hourly' },
    gearIncluded: [],
    coords: [35.6895, 139.6917], // Shinjuku
    imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=60', // City/Motorcycle
    user: {
      name: 'Kenji Sato',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60',
      isVerified: true,
      stats: { rating: 4.9, reviewCount: 55 }
    }
  },
  {
    id: 'o5',
    creatorId: 'u6',
    type: 'MEETUP',
    title: 'Golden Gai Night Walk',
    description: 'Lets explore the neon alleys of Shinjuku Golden Gai together. Bring your camera and lets grab drinks after!',
    price: { amount: 0, currency: 'USD', unit: 'fixed' },
    gearIncluded: [],
    coords: [35.6938, 139.7034], // Golden Gai
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=60', // Group Selfie/Vibe
    user: {
      name: 'Davide P.',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=60',
      isVerified: true,
      stats: { rating: 4.7, reviewCount: 15 }
    },
    maxAttendees: 10,
    attendees: [
      { avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop' },
      { avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop' },
      { avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop' },
      { avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop' },
      { avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&auto=format&fit=crop' }
    ]
  },
  {
    id: 'o6',
    creatorId: 'u7',
    type: 'MEETUP',
    title: 'Anime Shopping Spree',
    description: 'I am looking for someone to check out the retro game stores and figure shops with! Casual hangout.',
    price: { amount: 0, currency: 'USD', unit: 'fixed' },
    gearIncluded: [],
    coords: [35.6984, 139.7731], // Akihabara
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60', // Personal/Portrait
    user: {
      name: 'Tom Hollander',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=60',
      isVerified: false,
      stats: { rating: 5.0, reviewCount: 2 }
    },
    maxAttendees: 3,
    attendees: [
       { avatarUrl: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=100&auto=format&fit=crop' }
    ]
  }
];

export const MOCK_CAMPAIGNS = [
  {
    id: 'c1',
    brand: {
      name: 'Aman Tokyo',
      logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&auto=format&fit=crop&q=60',
      category: 'Hotel'
    },
    title: 'Luxury Stay & Spa Experience',
    location: 'Tokyo',
    coords: [35.6875, 139.7630], // Otemachi
    dates: { start: '2023-11-01', end: '2023-12-31' },
    requirements: {
      minFollowers: 100000,
      platforms: ['Instagram', 'TikTok'],
      deliverables: ['1 Reel', '3 Stories', 'Mention in bio']
    },
    perks: ['3 Nights Stay', 'All Inclusive', 'Spa Treatment'],
    matchScore: 92
  },
  {
    id: 'c2',
    brand: {
      name: '% Arabica Coffee',
      logoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&auto=format&fit=crop&q=60',
      category: 'Cafe'
    },
    title: 'New Blend Launch Tasting',
    location: 'Kyoto',
    coords: [35.6660, 139.7300], // Roppongi (Mocking Tokyo loc for demo)
    dates: { start: '2023-10-20', end: '2023-10-25' },
    requirements: {
      minFollowers: 10000,
      platforms: ['Instagram'],
      deliverables: ['1 Post', '2 Stories']
    },
    perks: ['Free Coffee for 1 Month', '$200 Gift Card'],
    matchScore: 85
  },
  {
    id: 'c3',
    brand: {
      name: 'Gentle Monster',
      logoUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=100&auto=format&fit=crop&q=60',
      category: 'Fashion'
    },
    title: 'Store Opening VIP Access',
    location: 'Seoul',
    coords: [35.6690, 139.7040], // Omotesando
    dates: { start: '2023-11-05', end: '2023-11-05' },
    requirements: {
      minFollowers: 50000,
      platforms: ['TikTok'],
      deliverables: ['Event Vlog (60s)', '1 Story']
    },
    perks: ['Free Sunglasses', 'VIP Party Access', 'Travel Stipend'],
    matchScore: 78
  },
  {
    id: 'c4',
    brand: {
      name: 'Sushi Zanmai',
      logoUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=100&auto=format&fit=crop&q=60',
      category: 'Restaurant'
    },
    title: 'Omakase Tasting Menu',
    location: 'Tokyo',
    coords: [35.6654, 139.7707], // Tsukiji
    dates: { start: '2023-10-15', end: '2023-11-15' },
    requirements: {
      minFollowers: 25000,
      platforms: ['Instagram', 'YouTube'],
      deliverables: ['1 Reel', 'Google Review']
    },
    perks: ['Omakase for 2', 'Sake Pairing'],
    matchScore: 65
  },
  {
    id: 'c5',
    brand: {
      name: 'Sony Japan',
      logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&auto=format&fit=crop&q=60',
      category: 'Tech'
    },
    title: 'Alpha Camera Street Walk',
    location: 'Tokyo',
    coords: [35.6300, 139.7500],
    dates: { start: '2023-10-25', end: '2023-10-30' },
    requirements: {
      minFollowers: 5000,
      platforms: ['YouTube', 'Instagram'],
      deliverables: ['3 High-Res Photos', '1 Reel']
    },
    perks: ['Camera Loan', '$300 Stipend'],
    matchScore: 88
  },
  {
    id: 'c6',
    brand: {
      name: 'TeamLab Planets',
      logoUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=100&auto=format&fit=crop&q=60',
      category: 'Experience'
    },
    title: 'Interactive Art Exhibition',
    location: 'Tokyo',
    coords: [35.6150, 139.7900], // Toyosu
    dates: { start: '2023-11-01', end: '2023-11-30' },
    requirements: {
      minFollowers: 20000,
      platforms: ['TikTok', 'Instagram'],
      deliverables: ['1 Viral Video', '2 Stories']
    },
    perks: ['VIP Entry', 'Plus One Ticket'],
    matchScore: 95
  },
  {
    id: 'c7',
    brand: {
      name: 'Ritz-Carlton Kyoto',
      logoUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=100&auto=format&fit=crop&q=60',
      category: 'Hotel'
    },
    title: 'Riverside Luxury Retreat',
    location: 'Kyoto',
    coords: [35.0116, 135.7681],
    dates: { start: '2023-12-01', end: '2023-12-15' },
    requirements: {
      minFollowers: 150000,
      platforms: ['Instagram', 'YouTube'],
      deliverables: ['Hotel Tour Vlog', '2 Feed Posts']
    },
    perks: ['2 Nights Suite', 'Private Dinner'],
    matchScore: 70
  },
  {
    id: 'c8',
    brand: {
      name: 'Uniqlo Ginza',
      logoUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100&auto=format&fit=crop&q=60',
      category: 'Fashion'
    },
    title: 'Winter Collection Showcase',
    location: 'Tokyo',
    coords: [35.6700, 139.7600],
    dates: { start: '2023-11-10', end: '2023-11-12' },
    requirements: {
      minFollowers: 30000,
      platforms: ['TikTok', 'Instagram'],
      deliverables: ['Try-on Haul', 'Store Visit Story']
    },
    perks: ['$500 Shopping Spree', 'Early Access'],
    matchScore: 82
  },
  {
    id: 'c9',
    brand: {
      name: 'Jeju Air',
      logoUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=100&auto=format&fit=crop&q=60',
      category: 'Travel'
    },
    title: 'Explore Korea Campaign',
    location: 'Seoul',
    coords: [37.5600, 126.9700],
    dates: { start: '2023-11-15', end: '2024-01-15' },
    requirements: {
      minFollowers: 80000,
      platforms: ['YouTube', 'Instagram'],
      deliverables: ['Flight Review', 'Destination Guide']
    },
    perks: ['Roundtrip Flights', 'Accommodation Support'],
    matchScore: 60
  },
  {
    id: 'c10',
    brand: {
      name: 'Blue Bottle Coffee',
      logoUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=100&auto=format&fit=crop&q=60',
      category: 'Cafe'
    },
    title: 'Holiday Blend Tasting',
    location: 'Tokyo',
    coords: [35.6600, 139.7300],
    dates: { start: '2023-12-05', end: '2023-12-20' },
    requirements: {
      minFollowers: 5000,
      platforms: ['Instagram'],
      deliverables: ['1 Aesthetic Photo', 'Story Series']
    },
    perks: ['Holiday Gift Set', 'Free Drinks'],
    matchScore: 90
  },
  {
    id: 'c11',
    brand: {
      name: 'Nintendo World',
      logoUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=100&auto=format&fit=crop&q=60',
      category: 'Entertainment'
    },
    title: 'Super Nintendo World VIP',
    location: 'Osaka',
    coords: [34.6654, 135.4323],
    dates: { start: '2023-11-01', end: '2023-12-31' },
    requirements: {
      minFollowers: 100000,
      platforms: ['YouTube', 'TikTok'],
      deliverables: ['Park Walkthrough', 'Shorts']
    },
    perks: ['Express Pass', 'Merch Bag', 'Hotel Stay'],
    matchScore: 98
  },
  {
    id: 'c12',
    brand: {
      name: 'Muji Hotel',
      logoUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=100&auto=format&fit=crop&q=60',
      category: 'Hotel'
    },
    title: 'Minimalist Staycation',
    location: 'Tokyo',
    coords: [35.6700, 139.7600],
    dates: { start: '2023-10-15', end: '2023-11-15' },
    requirements: {
      minFollowers: 40000,
      platforms: ['Instagram', 'YouTube'],
      deliverables: ['Room Tour', 'Lifestyle Photos']
    },
    perks: ['2 Nights Stay', 'Breakfast', 'Muji Gift'],
    matchScore: 84
  },
  {
    id: 'c13',
    brand: {
      name: 'GoPro',
      logoUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=100&auto=format&fit=crop&q=60',
      category: 'Tech'
    },
    title: 'Action Creator Summit',
    location: 'Tokyo',
    coords: [35.6900, 139.7000],
    dates: { start: '2023-11-20', end: '2023-11-22' },
    requirements: {
      minFollowers: 50000,
      platforms: ['YouTube', 'Instagram'],
      deliverables: ['Event Coverage', 'Hero Video']
    },
    perks: ['Hero 12 Black', 'Networking Access'],
    matchScore: 76
  },
  {
    id: 'c14',
    brand: {
      name: 'Ippudo Ramen',
      logoUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=100&auto=format&fit=crop&q=60',
      category: 'Restaurant'
    },
    title: 'Seasonal Ramen Launch',
    location: 'Tokyo',
    coords: [35.6600, 139.7000],
    dates: { start: '2023-11-01', end: '2023-11-15' },
    requirements: {
      minFollowers: 5000,
      platforms: ['TikTok', 'Instagram'],
      deliverables: ['Mukbang Video', 'Story']
    },
    perks: ['Free Meal for 2', 'T-Shirt'],
    matchScore: 89
  },
  {
    id: 'c15',
    brand: {
      name: 'Airbnb Experiences',
      logoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=60',
      category: 'Travel'
    },
    title: 'Hidden Tokyo Tours',
    location: 'Tokyo',
    coords: [35.6800, 139.7700],
    dates: { start: '2023-10-20', end: '2023-12-20' },
    requirements: {
      minFollowers: 15000,
      platforms: ['Instagram', 'TikTok'],
      deliverables: ['Experience Reel', '3 Photos']
    },
    perks: ['Free Tour', 'Local Guide', 'Transportation'],
    matchScore: 83
  },
  {
    id: 'c16',
    brand: {
      name: 'Shiseido',
      logoUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=100&auto=format&fit=crop&q=60',
      category: 'Beauty'
    },
    title: 'Ginza Flagship Experience',
    location: 'Tokyo',
    coords: [35.6700, 139.7600],
    dates: { start: '2023-11-05', end: '2023-11-10' },
    requirements: {
      minFollowers: 60000,
      platforms: ['YouTube', 'Instagram'],
      deliverables: ['Skincare Routine Video', 'Store Visit']
    },
    perks: ['Full Skincare Set', 'Facial Treatment'],
    matchScore: 75
  },
  {
    id: 'c17',
    brand: {
      name: 'Wework Japan',
      logoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=60',
      category: 'Business'
    },
    title: 'Digital Nomad Month',
    location: 'Tokyo',
    coords: [35.6600, 139.7000],
    dates: { start: '2023-11-01', end: '2023-12-01' },
    requirements: {
      minFollowers: 10000,
      platforms: ['Instagram', 'YouTube'],
      deliverables: ['Day in Life', 'Workspace Review']
    },
    perks: ['1 Month Free Desk', 'Community Events'],
    matchScore: 81
  },
  {
    id: 'c18',
    brand: {
      name: 'Klook',
      logoUrl: 'https://images.unsplash.com/photo-1569949381156-d54ca42a3040?w=100&auto=format&fit=crop&q=60',
      category: 'Travel'
    },
    title: 'Japan Rail Pass Promo',
    location: 'Tokyo',
    coords: [35.6800, 139.7700],
    dates: { start: '2023-10-15', end: '2024-01-15' },
    requirements: {
      minFollowers: 50000,
      platforms: ['TikTok', 'Instagram'],
      deliverables: ['Travel Tips Video', 'Link in Bio']
    },
    perks: ['7-Day JR Pass', 'Attraction Tickets'],
    matchScore: 79
  },
  {
    id: 'c19',
    brand: {
      name: 'Dover Street Market',
      logoUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&auto=format&fit=crop&q=60',
      category: 'Fashion'
    },
    title: 'Streetwear Drop Coverage',
    location: 'Tokyo',
    coords: [35.6700, 139.7600],
    dates: { start: '2023-11-18', end: '2023-11-18' },
    requirements: {
      minFollowers: 25000,
      platforms: ['Instagram', 'TikTok'],
      deliverables: ['Live Coverage', 'Outfit Post']
    },
    perks: ['VIP Entry', '$200 Credit'],
    matchScore: 86
  },
  {
    id: 'c20',
    brand: {
      name: 'Pokemon Center',
      logoUrl: 'https://images.unsplash.com/photo-1638613067237-b1127ef06c00?w=100&auto=format&fit=crop&q=60',
      category: 'Retail'
    },
    title: 'New Plush Collection',
    location: 'Tokyo',
    coords: [35.6800, 139.7700],
    dates: { start: '2023-11-10', end: '2023-11-20' },
    requirements: {
      minFollowers: 15000,
      platforms: ['Instagram', 'TikTok'],
      deliverables: ['Unboxing', 'Store Visit']
    },
    perks: ['Product Bundle', 'Gift Card'],
    matchScore: 91
  },
  {
    id: 'c21',
    brand: {
      name: 'Samsung Korea',
      logoUrl: 'https://images.unsplash.com/photo-1610945265078-d86fbc14acc2?w=100&auto=format&fit=crop&q=60',
      category: 'Tech'
    },
    title: 'Galaxy Z Flip Experience',
    location: 'Seoul',
    coords: [37.5600, 126.9700],
    dates: { start: '2023-11-01', end: '2023-11-30' },
    requirements: {
      minFollowers: 100000,
      platforms: ['Instagram', 'YouTube'],
      deliverables: ['Tech Review', 'Creative Selfies']
    },
    perks: ['Galaxy Z Flip', 'Seoul Trip'],
    matchScore: 68
  },
  {
    id: 'c22',
    brand: {
      name: 'Hyatt Regency',
      logoUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=100&auto=format&fit=crop&q=60',
      category: 'Hotel'
    },
    title: 'Business Suite Promo',
    location: 'Tokyo',
    coords: [35.6900, 139.6900],
    dates: { start: '2023-11-05', end: '2023-11-25' },
    requirements: {
      minFollowers: 75000,
      platforms: ['LinkedIn', 'Instagram'],
      deliverables: ['Professional Photos', 'Review']
    },
    perks: ['3 Nights Stay', 'Executive Lounge'],
    matchScore: 72
  },
  {
    id: 'c23',
    brand: {
      name: 'Gong Cha',
      logoUrl: 'https://images.unsplash.com/photo-1558317374-a3545eca46f2?w=100&auto=format&fit=crop&q=60',
      category: 'Cafe'
    },
    title: 'Seasonal Bubble Tea',
    location: 'Tokyo',
    coords: [35.6600, 139.7000],
    dates: { start: '2023-10-25', end: '2023-11-10' },
    requirements: {
      minFollowers: 5000,
      platforms: ['TikTok'],
      deliverables: ['Taste Test Video']
    },
    perks: ['10 Drink Vouchers', 'Merch'],
    matchScore: 87
  },
  {
    id: 'c24',
    brand: {
      name: 'Lululemon',
      logoUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=100&auto=format&fit=crop&q=60',
      category: 'Fitness'
    },
    title: 'Community Yoga Event',
    location: 'Tokyo',
    coords: [35.6600, 139.7100],
    dates: { start: '2023-11-12', end: '2023-11-12' },
    requirements: {
      minFollowers: 10000,
      platforms: ['Instagram'],
      deliverables: ['Event Stories', 'Feed Post']
    },
    perks: ['Yoga Outfit', 'Workshop Entry'],
    matchScore: 85
  },
  {
    id: 'c25',
    brand: {
      name: 'Peach Aviation',
      logoUrl: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=100&auto=format&fit=crop&q=60',
      category: 'Travel'
    },
    title: 'Weekend Getaway Sale',
    location: 'Osaka',
    coords: [34.6900, 135.5000],
    dates: { start: '2023-11-01', end: '2023-11-30' },
    requirements: {
      minFollowers: 20000,
      platforms: ['Instagram', 'TikTok'],
      deliverables: ['Travel Reel', 'Budget Tips']
    },
    perks: ['Domestic Flight Ticket', 'Hotel Voucher'],
    matchScore: 80
  },
  {
    id: 'c26',
    brand: {
      name: 'Tsutaya Books',
      logoUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=100&auto=format&fit=crop&q=60',
      category: 'Retail'
    },
    title: 'Daikanyama T-Site Feature',
    location: 'Tokyo',
    coords: [35.6500, 139.7000],
    dates: { start: '2023-11-15', end: '2023-11-30' },
    requirements: {
      minFollowers: 8000,
      platforms: ['Instagram'],
      deliverables: ['Photo Carousel', 'Quiet Vlog']
    },
    perks: ['Cafe Credits', 'Book Bundle'],
    matchScore: 93
  },
  {
    id: 'c27',
    brand: {
      name: 'Beam Suntory',
      logoUrl: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=100&auto=format&fit=crop&q=60',
      category: 'Beverage'
    },
    title: 'Yamazaki Distillery Tour',
    location: 'Osaka',
    coords: [34.8900, 135.6700],
    dates: { start: '2023-12-01', end: '2023-12-10' },
    requirements: {
      minFollowers: 30000,
      platforms: ['YouTube', 'Instagram'],
      deliverables: ['Distillery Vlog', 'Tasting Notes']
    },
    perks: ['Private Tour', 'Whisky Tasting'],
    matchScore: 77
  },
  {
    id: 'c28',
    brand: {
      name: 'Canon',
      logoUrl: 'https://images.unsplash.com/photo-1624823183483-3ce1a550c605?w=100&auto=format&fit=crop&q=60',
      category: 'Tech'
    },
    title: 'EOS R50 Creator Test',
    location: 'Tokyo',
    coords: [35.6500, 139.7500],
    dates: { start: '2023-11-01', end: '2023-11-14' },
    requirements: {
      minFollowers: 15000,
      platforms: ['YouTube', 'TikTok'],
      deliverables: ['Vlog Test', 'Feature Review']
    },
    perks: ['Camera Loan', 'SD Cards'],
    matchScore: 84
  },
  {
    id: 'c29',
    brand: {
      name: 'Andaz Tokyo',
      logoUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=100&auto=format&fit=crop&q=60',
      category: 'Hotel'
    },
    title: 'Rooftop Bar Night',
    location: 'Tokyo',
    coords: [35.6600, 139.7500],
    dates: { start: '2023-11-10', end: '2023-11-12' },
    requirements: {
      minFollowers: 25000,
      platforms: ['Instagram'],
      deliverables: ['Reel', '3 Stories']
    },
    perks: ['Cocktails for 2', 'Bar Bites'],
    matchScore: 88
  },
  {
    id: 'c30',
    brand: {
      name: 'ABC Cooking Studio',
      logoUrl: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=100&auto=format&fit=crop&q=60',
      category: 'Experience'
    },
    title: 'Japanese Home Cooking',
    location: 'Tokyo',
    coords: [35.6800, 139.7600],
    dates: { start: '2023-11-05', end: '2023-11-20' },
    requirements: {
      minFollowers: 5000,
      platforms: ['Instagram', 'YouTube'],
      deliverables: ['Cooking Video', 'Recipe Post']
    },
    perks: ['Free Lesson', 'Apron'],
    matchScore: 92
  },
  {
    id: 'c31',
    brand: {
      name: 'Asics',
      logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60',
      category: 'Fashion'
    },
    title: 'Tokyo Run Club',
    location: 'Tokyo',
    coords: [35.6800, 139.7500], // Imperial Palace
    dates: { start: '2023-11-18', end: '2023-11-18' },
    requirements: {
      minFollowers: 12000,
      platforms: ['Instagram', 'TikTok'],
      deliverables: ['Run Coverage', 'Gear Review']
    },
    perks: ['Running Shoes', 'Running Kit'],
    matchScore: 81
  },
  {
    id: 'c32',
    brand: {
      name: 'Don Quijote',
      logoUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=100&auto=format&fit=crop&q=60',
      category: 'Retail'
    },
    title: 'Mega Store Treasure Hunt',
    location: 'Tokyo',
    coords: [35.6600, 139.7000],
    dates: { start: '2023-11-01', end: '2023-11-30' },
    requirements: {
      minFollowers: 50000,
      platforms: ['TikTok', 'YouTube'],
      deliverables: ['Haul Video', 'Store Challenge']
    },
    perks: ['$200 Voucher', 'Souvenir Bag'],
    matchScore: 96
  },
  {
    id: 'c33',
    brand: {
      name: 'Line Friends',
      logoUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=100&auto=format&fit=crop&q=60',
      category: 'Retail'
    },
    title: 'Character Collab',
    location: 'Seoul',
    coords: [37.5200, 127.0200],
    dates: { start: '2023-12-01', end: '2023-12-31' },
    requirements: {
      minFollowers: 20000,
      platforms: ['Instagram', 'TikTok'],
      deliverables: ['Photo Op', 'Merch Review']
    },
    perks: ['Plushie Set', 'Cafe Voucher'],
    matchScore: 78
  },
  {
    id: 'c34',
    brand: {
      name: 'Conrad Osaka',
      logoUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&auto=format&fit=crop&q=60',
      category: 'Hotel'
    },
    title: 'Sky View Afternoon Tea',
    location: 'Osaka',
    coords: [34.6900, 135.4900],
    dates: { start: '2023-11-15', end: '2023-11-30' },
    requirements: {
      minFollowers: 30000,
      platforms: ['Instagram'],
      deliverables: ['Reel', '3 Stories']
    },
    perks: ['Afternoon Tea for 2', 'Spa Access'],
    matchScore: 73
  }
];
