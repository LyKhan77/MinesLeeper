// Custom hook for achievement management

import { useState, useEffect, useCallback, useRef } from 'react';
import { getAchievements, checkAchievements, getRarityColor } from '../utils/achievements';
import { Achievement, AchievementID, Difficulty } from '../types/achievements';

export const useAchievements = () => {
  const [achievements, setAchievements] = useState<Record<AchievementID, Achievement>>({} as Record<AchievementID, Achievement>);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const justUnlockedRef = useRef<Set<AchievementID>>(new Set());

  // Load achievements on mount
  useEffect(() => {
    const data = getAchievements();
    setAchievements(data.achievements);
    setTotalUnlocked(data.totalUnlocked);
  }, []);

  // Check and unlock achievements
  const checkUnlock = useCallback((
    eventType: 'game_won' | 'game_lost' | 'daily_completed',
    data: {
      difficulty?: Difficulty;
      time?: number;
      currentStreak?: number;
      totalGames?: number;
      perfectGame?: boolean;
      bombSquad?: boolean;
    }
  ) => {
    const newUnlocks = checkAchievements(eventType, data);

    // Show toast for each new unlock (with delay for multiple)
    newUnlocks.forEach((id, index) => {
      if (!justUnlockedRef.current.has(id)) {
        justUnlockedRef.current.add(id);
        
        setTimeout(() => {
          const achievement = getAchievements().achievements[id];
          setUnlockedAchievement(achievement);
          setShowToast(true);

          // Hide toast after delay
          setTimeout(() => {
            setShowToast(false);
          }, 4000);
        }, index * 500); // Stagger multiple unlocks
      }
    });

    // Refresh achievements data
    const updated = getAchievements();
    setAchievements(updated.achievements);
    setTotalUnlocked(updated.totalUnlocked);

    return newUnlocks;
  }, []);

  // Refresh achievements data
  const refresh = useCallback(() => {
    const data = getAchievements();
    setAchievements(data.achievements);
    setTotalUnlocked(data.totalUnlocked);
  }, []);

  // Hide toast
  const hideToast = useCallback(() => {
    setShowToast(false);
  }, []);

  return {
    achievements,
    totalUnlocked,
    checkUnlock,
    refresh,
    showToast,
    hideToast,
    unlockedAchievement,
    getRarityColor,
  };
};

export default useAchievements;
