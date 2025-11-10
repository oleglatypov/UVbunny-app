/**
 * Domain types for UVbunny app
 */

export interface UserConfig {
  pointsPerCarrot: number; // 1-10
  maxHappinessPoints?: number; // Optional cap for progress bar (default: pointsPerCarrot * 100)
  updatedAt: Date;
}

export interface Bunny {
  id?: string;
  name: string; // 1-40 chars
  colorClass: BunnyColor;
  eventCount: number;
  createdAt: Date;
}

export type BunnyColor = 'cream' | 'gray' | 'brown' | 'white' | 'black' | 'pink';

export type BunnyMood = 'sad' | 'average' | 'happy';

export interface CarrotEvent {
  id?: string;
  type: 'CARROT_GIVEN';
  carrots: number; // 1-50
  createdAt: Date;
  source?: 'ui' | 'function'; // Optional tracking for source of action
  notes?: string; // Optional text notes (future UX)
}

export interface BunnyWithHappiness extends Bunny {
  happiness: number; // eventCount * pointsPerCarrot
  mood: BunnyMood;
  progressBarPercent?: number; // 0-100 for progress bar display
}

export interface GlobalStats {
  avgHappiness: number;
  updatedAt: Date;
}

