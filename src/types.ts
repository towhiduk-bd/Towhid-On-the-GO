export type DistanceCategory = 
  | '5K'
  | '7.5K'
  | '10K'
  | '15K'
  | 'Half Marathon'
  | '25K'
  | '30K'
  | 'Marathon'
  | 'Ultra'
  | 'Custom';

export type EventType = 'Road' | 'Trail' | 'Virtual' | 'Other';

export type RecordSource = 'Manual' | 'Excel Import' | 'Strava';

export type RecordVisibility = 'Public' | 'Private';

export interface RunningRecord {
  id: string;
  sl_no?: number;
  event_name: string;
  event_date: string; // YYYY-MM-DD
  year: number; // derived from event_date
  distance_km: number;
  distance_category: DistanceCategory | string;
  bib_number?: string;
  official_time?: string; // HH:MM:SS or MM:SS
  strava_time?: string; // HH:MM:SS or MM:SS
  pace?: string; // auto-calculated e.g., "5:15 /km"
  strava_url?: string;
  certificate_url?: string;
  location?: string;
  organizer?: string;
  event_type: EventType;
  notes?: string;
  source: RecordSource;
  visibility: RecordVisibility;
  created_at: string;
  updated_at: string;
}

export interface FilterState {
  searchQuery: string;
  year: string; // 'All' or specific year '2025'
  category: string; // 'All' or specific category
  eventType: string; // 'All' or specific type
  visibility: string; // 'All', 'Public', 'Private'
  sortBy: 'date_desc' | 'date_asc' | 'distance_desc' | 'distance_asc' | 'time_asc' | 'time_desc' | 'pace_asc';
  viewMode: 'table' | 'cards';
}

export interface ImportPreviewRow {
  index: number;
  raw: Record<string, any>;
  mapped: Partial<RunningRecord>;
  isValid: boolean;
  validationErrors: string[];
  isDuplicate: boolean;
  duplicateReason?: string;
  selected: boolean;
}

export interface StravaConfig {
  isConnected: boolean;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  athleteName?: string;
  lastSyncedAt?: string;
}

export interface OverallStats {
  totalRuns: number;
  totalDistanceKm: number;
  halfMarathonCount: number;
  tenKCount: number;
  longestRunKm: number;
  longestRunEvent?: string;
  longestRunRecord?: RunningRecord;
  latestRun?: RunningRecord;
  best5KTime?: string;
  best5KEvent?: string;
  best10KTime?: string;
  best10KEvent?: string;
  best10KRecord?: RunningRecord;
  bestHalfMarathonTime?: string;
  bestHalfMarathonEvent?: string;
  bestHalfMarathonRecord?: RunningRecord;
  best25KTime?: string;
  best25KEvent?: string;
  best30KTime?: string;
  best30KEvent?: string;
  bestMarathonTime?: string;
  bestMarathonEvent?: string;
  bestMarathonRecord?: RunningRecord;
  runsByYear: { year: number; count: number; distance: number }[];
  recentRuns: RunningRecord[];
}

export interface TravelBlog {
  id: string;
  title: string;
  location: string;
  date: string;
  readTime: string;
  summary: string;
  imageUrl?: string;
  images?: string[]; // Maximum 2 pictures, max 800KB each
  tags: string[];
}

export interface UserBio {
  name: string;
  titleTagline: string;
  aboutMe: string;
  location: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  stravaUrl: string;
  hobbies: {
    title: string;
    category: string;
    description: string;
    icon: string;
  }[];
  travelBlogs: TravelBlog[];
}
