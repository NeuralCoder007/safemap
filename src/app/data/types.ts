export type PlaceType =
  | 'parking'
  | 'street'
  | 'apartment'
  | 'airbnb'
  | 'campus'
  | 'transit'
  | 'office'
  | 'cafe'
  | 'library'
  | 'other';

export type VibeTag =
  | 'break-in'
  | 'theft'
  | 'harassment'
  | 'noise'
  | 'unsafe-night'
  | 'poor-lighting'
  | 'scam'
  | 'clean-safe'
  | 'creepy-vibes'
  | 'sketchy-people';

export type Vibe = 'unsafe' | 'sketchy' | 'safe';

export interface Place {
  id: string;
  name?: string;
  location: string; // "Mission & 16th St"
  lat: number;
  lng: number;
  type: PlaceType;
  vibe: Vibe;
  vibeScore: number; // Percentage 0-100
  topTags: VibeTag[];
  reportCount: number;
  confidence: 'low' | 'medium' | 'high';
  lastChecked?: string; // Recency stamp
}

export interface Report {
  id: string;
  placeId: string;
  tags: VibeTag[];
  vibe: Vibe;
  note?: string; // optional short note
  isVerified: boolean;
  author: string;
  date: string;
  helpful: number;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  reportsPosted: number;
  helpfulVotes: number;
  badge: 'new' | 'verified' | 'trusted';
}
