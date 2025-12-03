
export interface Creator {
  name: string;
  handle: string;
  tagline: string;
  location: string;
  bio: string;
  stats: {
    rating: number;
    locationsVisited: number;
    mapsBuilt: number;
    travelersGuided: number;
  };
  socials: {
    instagram: string;
    youtube: string;
    tiktok: string;
    twitter: string;
  };
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  isPremium: boolean;
  students: number;
}

export interface Destination {
  id: string;
  country: string;
  flag: string;
  image: string;
  description: string;
  poiCount: number;
  price: number;
}

export interface Podcast {
  id: string;
  title: string;
  duration: string;
  date: string;
  isPremium: boolean;
  image: string;
}

export interface BlogPost {
  id: string;
  title: string;
  preview: string;
  date: string;
  readTime: string;
  image: string;
  isPremium: boolean;
  category: string;
  content?: string; // HTML string for the full article
  tags?: string[];
}

export interface DigitalAsset {
  id: string;
  title: string;
  type: 'LUT' | 'RAW Photo' | 'Drone Footage' | 'Preset';
  price: number;
  image: string;
}

export interface SocialPost {
  id: string;
  type: 'youtube' | 'short' | 'reel';
  thumbnail: string;
  views: string;
  title: string;
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  slotsAvailable: number;
  status: 'available' | 'limited' | 'full';
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  type: 'course' | 'asset' | 'map' | 'consultation';
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number;
}