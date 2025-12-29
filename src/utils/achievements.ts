// Achievement system utilities

import { Achievement, AchievementID, AchievementProgress } from '../types/achievements';
import { Difficulty } from '../types/index';

const ACHIEVEMENTS_KEY = 'minesleeper-achievements';

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Record<AchievementID, Omit<Achievement, 'unlocked' | 'unlockedAt' | 'progress'>> = {
  first_win: {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🎉',
    rarity: 'common',
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Win a game in under 60 seconds',
    icon: '⚡',
    rarity: 'rare',
  },
  perfect_game: {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Win without any mistakes',
    icon: '💎',
    rarity: 'epic',
  },
  marathon: {
    id: 'marathon',
    name: 'Marathon',
    description: 'Win 5 games in a row',
    icon: '🔥',
    rarity: 'rare',
    maxProgress: 5,
  },
  bomb_squad: {
    id: 'bomb_squad',
    name: 'Bomb Squad',
    description: 'Flag all mines correctly in one game',
    icon: '💣',
    rarity: 'epic',
  },
  beginner_champion: {
    id: 'beginner_champion',
    name: 'Beginner Champion',
    description: 'Win 10 games on beginner difficulty',
    icon: '🥉',
    rarity: 'common',
    maxProgress: 10,
  },
  intermediate_expert: {
    id: 'intermediate_expert',
    name: 'Intermediate Expert',
    description: 'Win 10 games on intermediate difficulty',
    icon: '🥈',
    rarity: 'rare',
    maxProgress: 10,
  },
  elite_miner: {
    id: 'elite_miner',
    name: 'Elite Miner',
    description: 'Win 5 games on expert difficulty',
    icon: '🥇',
    rarity: 'epic',
    maxProgress: 5,
  },
  daily_warrior: {
    id: 'daily_warrior',
    name: 'Daily Warrior',
    description: 'Complete 7 daily challenges',
    icon: '⚔️',
    rarity: 'legendary',
    maxProgress: 7,
  },
  centurion: {
    id: 'centurion',
    name: 'Centurion',
    description: 'Play 100 total games',
    icon: '🏆',
    rarity: 'legendary',
    maxProgress: 100,
  },
};

// Get achievements from localStorage
export const getAchievements = (): AchievementProgress => {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const achievements: Record<AchievementID, Achievement> = {};
      let totalUnlocked = 0;

      // Merge with definitions
      Object.entries(ACHIEVEMENT_DEFINITIONS).forEach(([id, def]) => {
        const saved = parsed.achievements[id];
        achievements[id as AchievementID] = {
          ...def,
          unlocked: saved?.unlocked || false,
          unlockedAt: saved?.unlockedAt,
          progress: saved?.progress || 0,
        };
        if (achievements[id as AchievementID].unlocked) {
          totalUnlocked++;
        }
      });

      return { achievements, totalUnlocked };
    }
  } catch (error) {
    console.error('Error loading achievements:', error);
  }

  // Return default achievements
  const achievements: Record<AchievementID, Achievement> = {
    first_win: { ...ACHIEVEMENT_DEFINITIONS.first_win, unlocked: false },
    speed_demon: { ...ACHIEVEMENT_DEFINITIONS.speed_demon, unlocked: false },
    perfect_game: { ...ACHIEVEMENT_DEFINITIONS.perfect_game, unlocked: false },
    marathon: { ...ACHIEVEMENT_DEFINITIONS.marathon, unlocked: false, progress: 0 },
    bomb_squad: { ...ACHIEVEMENT_DEFINITIONS.bomb_squad, unlocked: false },
    beginner_champion: { ...ACHIEVEMENT_DEFINITIONS.beginner_champion, unlocked: false, progress: 0 },
    intermediate_expert: { ...ACHIEVEMENT_DEFINITIONS.intermediate_expert, unlocked: false, progress: 0 },
    elite_miner: { ...ACHIEVEMENT_DEFINITIONS.elite_miner, unlocked: false, progress: 0 },
    daily_warrior: { ...ACHIEVEMENT_DEFINITIONS.daily_warrior, unlocked: false, progress: 0 },
    centurion: { ...ACHIEVEMENT_DEFINITIONS.centurion, unlocked: false, progress: 0 },
  };

  return { achievements, totalUnlocked: 0 };
};

// Save achievements to localStorage
const saveAchievements = (progress: AchievementProgress): void => {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving achievements:', error);
  }
};

// Check and unlock achievements based on game event
export const checkAchievements = (
  eventType: 'game_won' | 'game_lost' | 'daily_completed',
  data: {
    difficulty?: Difficulty;
    time?: number;
    currentStreak?: number;
    totalGames?: number;
    perfectGame?: boolean;
    bombSquad?: boolean;
  }
): AchievementID[] => {
  const progress = getAchievements();
  const newUnlocks: AchievementID[] = [];

  // Check each achievement
  Object.entries(progress.achievements).forEach(([id, achievement]) => {
    if (achievement.unlocked) return; // Already unlocked

    let shouldUnlock = false;
    let progressValue = achievement.progress || 0;

    switch (id as AchievementID) {
      case 'first_win':
        if (eventType === 'game_won') shouldUnlock = true;
        break;

      case 'speed_demon':
        if (eventType === 'game_won' && data.time && data.time < 60) {
          shouldUnlock = true;
        }
        break;

      case 'perfect_game':
        if (eventType === 'game_won' && data.perfectGame) {
          shouldUnlock = true;
        }
        break;

      case 'marathon':
        if (eventType === 'game_won' && data.currentStreak) {
          progressValue = Math.min(data.currentStreak, achievement.maxProgress || 5);
          if (progressValue >= (achievement.maxProgress || 5)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'bomb_squad':
        if (eventType === 'game_won' && data.bombSquad) {
          shouldUnlock = true;
        }
        break;

      case 'beginner_champion':
        if (eventType === 'game_won' && data.difficulty === 'beginner') {
          progressValue = (achievement.progress || 0) + 1;
          if (progressValue >= (achievement.maxProgress || 10)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'intermediate_expert':
        if (eventType === 'game_won' && data.difficulty === 'intermediate') {
          progressValue = (achievement.progress || 0) + 1;
          if (progressValue >= (achievement.maxProgress || 10)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'elite_miner':
        if (eventType === 'game_won' && data.difficulty === 'expert') {
          progressValue = (achievement.progress || 0) + 1;
          if (progressValue >= (achievement.maxProgress || 5)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'daily_warrior':
        if (eventType === 'daily_completed') {
          progressValue = (achievement.progress || 0) + 1;
          if (progressValue >= (achievement.maxProgress || 7)) {
            shouldUnlock = true;
          }
        }
        break;

      case 'centurion':
        if (data.totalGames && data.totalGames >= 100) {
          shouldUnlock = true;
        }
        progressValue = data.totalGames || 0;
        break;
    }

    // Update progress
    if (achievement.maxProgress) {
      progress.achievements[id as AchievementID].progress = progressValue;
    }

    // Unlock if conditions met
    if (shouldUnlock) {
      progress.achievements[id as AchievementID].unlocked = true;
      progress.achievements[id as AchievementID].unlockedAt = new Date().toISOString();
      progress.totalUnlocked++;
      newUnlocks.push(id as AchievementID);
    }
  });

  // Save if there are changes
  if (newUnlocks.length > 0) {
    saveAchievements(progress);
  }

  return newUnlocks;
};

// Get rarity color
export const getRarityColor = (rarity: Achievement['rarity']): string => {
  const colors = {
    common: 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-300',
    rare: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300',
    epic: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300',
    legendary: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-300',
  };
  return colors[rarity];
};
