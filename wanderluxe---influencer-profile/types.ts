

export interface Tour {
  id: string;
  name: string;
  type: 'Hiking' | 'City' | 'Photo' | 'Food';
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discount?: string; // e.g. "20% OFF"
  type: 'Itinerary' | 'Guide' | 'Consulting';
  image: string;
}

export interface PointOfInterest {
  name: string;
  tags: string[];
}

export interface Country {
  id: string;
  name: string;
  flagCode: string; // simplified for visual
  pointsOfInterestCount: number;
  pois: PointOfInterest[];
  image: string;
  description: string;
  mapPrice?: number;
  mapDiscount?: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  isPremium: boolean;
  image: string;
}

export interface BlogPost {
  id: string;
  title: string;
  preview: string;
  date: string;
  isPremium: boolean;
  image: string;
}

export interface MediaAsset {
  id: string;
  title: string;
  description: string;
  type: 'Video' | 'Photo' | 'Preset';
  price: number;
  image: string;
}

export interface ExternalPlatformLink {
  id: string;
  platform: 'Airbnb' | 'GetYourGuide' | 'Viator';
  title: string;
  subtitle: string;
  url: string;
  rating?: number;
}