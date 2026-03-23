export type JobSource = 'adzuna' | 'arbeitnow' | 'jsearch' | 'themuse' | 'remoteok';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  salary?: string;
  postedDate?: string;
  source: JobSource;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  matchScore?: number;
  languages?: string[];
  experienceRequired?: string;
}

export interface UserProfile {
  title: string;
  languages: string[];
  experienceYears: number;
  location: string;
  distanceKm: number;
  latitude?: number;
  longitude?: number;
}

export interface SearchParams {
  title: string;
  location: string;
  distanceKm: number;
  languages: string[];
  experienceYears: number;
}

export interface JobSearchResult {
  jobs: Job[];
  totalCount: number;
  sources: { source: JobSource; count: number }[];
}

export interface MatchResult {
  jobId: string;
  score: number;
  reasons: string[];
}
