export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number; // unix timestamp ms
  depth: number; // km
  url: string;
  latitude: number;
  longitude: number;
}

export type MagnitudeThreshold = 6 | 7 | 7.5 | 8;

export interface YearCounts {
  year: number;
  m6: number;
  m7: number;
  m75: number;
  m8: number;
}

export interface EarthquakeData {
  years: YearCounts[];
  currentYearEvents: Earthquake[];
  allYearEvents: Record<number, Earthquake[]>;
  cutoffDate: string; // ISO date string YYYY-MM-DD
  currentYear: number;
  lastUpdated: string; // ISO timestamp
}

export interface Stats {
  current: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  rank: number;
  totalYears: number;
  percentile: number;
  percentDiffFromMean: number;
}

export type HistoryRange = 10 | 15 | 25 | "all";
