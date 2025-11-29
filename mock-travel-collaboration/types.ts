

export type UserRole = 'traveler' | 'creator' | 'business';

export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  isVerified: boolean;
  role: UserRole;
  stats: {
    rating: number;
    reviewCount: number;
  };
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  location: string;
  coords: [number, number]; // Added for Map
  tags: string[];
  metrics: {
    followers: string;
    engagement: string;
    avgLikes: string;
  };
  isVerified: boolean;
  platforms: ('Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn')[];
  availability: {
    status: 'AVAILABLE' | 'BUSY' | 'BOOKED';
    until?: string;
  };
  portfolio?: string[];
}

export interface Trip {
  id: string;
  userId: string;
  destination: {
    city: string;
    country: string;
    coordinates: [number, number]; // lat, lng
    radiusKm: number;
  };
  dates: {
    start: string;
    end: string;
  };
  status: 'active' | 'upcoming' | 'past';
  intents: string[];
  userRole: UserRole;
}

export interface Offer {
  id: string;
  creatorId: string;
  tripId?: string;
  type: 'MEETUP' | 'SESSION' | 'SERVICE';
  title: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    unit: 'fixed' | 'hourly';
  };
  gearIncluded: string[];
  coords: [number, number];
  user: Partial<User>;
  imageUrl?: string; // New field for specific thumbnail/hero image
  // New Social Features
  attendees?: Partial<User>[];
  maxAttendees?: number;
}

export interface Campaign {
  id: string;
  brand: {
    name: string;
    logoUrl: string;
    category: string;
  };
  title: string;
  location: string;
  coords: [number, number]; // Added for Map
  dates: {
    start: string;
    end: string;
  };
  requirements: {
    minFollowers: number;
    platforms: ('Instagram' | 'TikTok' | 'YouTube' | 'LinkedIn')[];
    deliverables: string[];
  };
  perks: string[];
  matchScore: number;
}

export interface TripContextState {
  activeTripId: string | null;
  activeTrip: Trip | undefined;
  userMode: UserRole;
  intentFilter: 'all' | 'social' | 'work';
  setActiveTrip: (id: string) => void;
  setUserMode: (mode: UserRole) => void;
  setIntentFilter: (filter: 'all' | 'social' | 'work') => void;
}

// Unified Type for Map
export interface MapItem {
  id: string;
  category: 'OFFER' | 'CREATOR' | 'CAMPAIGN';
  type: string; // Subtype (e.g. MEETUP, SESSION)
  coords: [number, number];
  title: string;
  avatarUrl: string;
  priceDisplay?: string; 
  originalData: Offer | Creator | Campaign;
}