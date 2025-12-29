// Achievement types and interfaces

import { Difficulty } from './index';

export type AchievementID =
  | 'first_win'
  | 'speed_demon'
  | 'perfect_game'
  | 'marathon'
  | 'bomb_squad'
  | 'beginner_champion'
  | 'intermediate_expert'
  | 'elite_miner'
  | 'daily_warrior'
  | 'centurion';

export interface Achievement {
  id: AchievementID;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string; // ISO date string
  progress?: number;
  maxProgress?: number;
}

export interface AchievementProgress {
  achievements: Record<AchievementID, Achievement>;
  totalUnlocked: number;
}

export interface AchievementEvent {
  type: 'game_won' | 'game_lost' | 'flag_placed' | 'daily_completed';
  difficulty?: Difficulty;
  time?: number;
  flagsCorrect?: boolean;
  totalGames?: number;
  currentStreak?: number;
}
