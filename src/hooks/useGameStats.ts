// Hook for game statistics management

import { useGameStats as useGameStatsFromStorage } from './useLocalStorage';

export const useGameStats = () => {
  const { stats, refresh } = useGameStatsFromStorage();

  const getWinRate = (): number => {
    if (stats.totalGames === 0) return 0;
    return Math.round((stats.gamesWon / stats.totalGames) * 100);
  };

  const getLossRate = (): number => {
    if (stats.totalGames === 0) return 0;
    return Math.round((stats.gamesLost / stats.totalGames) * 100);
  };

  const getAverageGamesPerDay = (): number => {
    // Assuming player started playing when first game was recorded
    if (stats.totalGames === 0) return 0;
    return 1; // Simplified, could be enhanced with first game date
  };

  const getTotalPlayTime = (): number => {
    // This would need to be tracked separately
    return 0;
  };

  return {
    stats,
    getWinRate,
    getLossRate,
    getAverageGamesPerDay,
    getTotalPlayTime,
    refresh,
  };
};
