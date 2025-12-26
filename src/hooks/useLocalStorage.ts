// Custom hook for localStorage management

import { useState, useEffect, useCallback } from 'react';
import {
  getPlayerData,
  setPlayerName,
  hasPlayerName,
  getGameStats,
  getHighScores,
  getDailyChallengeState,
  completeDailyChallenge,
  updateGameStats,
  clearAllData,
} from '../utils/storage';
import { PlayerData, Difficulty, HighScoreEntry, GameStats, DailyChallengeState } from '../types';

export const useLocalStorage = () => {
  const [playerData, setPlayerDataState] = useState<PlayerData>(getPlayerData());
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data on mount
  useEffect(() => {
    setPlayerDataState(getPlayerData());
    setIsLoaded(true);
  }, []);

  // Refresh data from storage
  const refresh = useCallback(() => {
    setPlayerDataState(getPlayerData());
  }, []);

  // Set player name
  const saveName = useCallback((name: string) => {
    setPlayerName(name);
    refresh();
  }, [refresh]);

  // Update game stats
  const saveGameStats = useCallback((won: boolean, difficulty: Difficulty, time: number) => {
    updateGameStats(won, difficulty, time);
    refresh();
  }, [refresh]);

  // Complete daily challenge
  const saveDailyChallenge = useCallback((time: number) => {
    completeDailyChallenge(time);
    refresh();
  }, [refresh]);

  // Clear all data
  const resetData = useCallback(() => {
    clearAllData();
    refresh();
  }, [refresh]);

  return {
    playerData,
    isLoaded,
    hasName: hasPlayerName(),
    stats: playerData.stats,
    saveName,
    saveGameStats,
    saveDailyChallenge,
    resetData,
    refresh,
  };
};

export const useHighScores = (difficulty: Difficulty) => {
  const [scores, setScores] = useState<HighScoreEntry[]>([]);

  useEffect(() => {
    setScores(getHighScores(difficulty));
  }, [difficulty]);

  return scores;
};

export const useGameStats = () => {
  const [stats, setStats] = useState<GameStats>(getGameStats());

  const refresh = useCallback(() => {
    setStats(getGameStats());
  }, []);

  return { stats, refresh };
};

export const useDailyChallenge = () => {
  const [challenge, setChallenge] = useState<DailyChallengeState>(getDailyChallengeState());

  const refresh = useCallback(() => {
    setChallenge(getDailyChallengeState());
  }, []);

  const complete = useCallback((time: number) => {
    completeDailyChallenge(time);
    refresh();
  }, [refresh]);

  return { challenge, complete, refresh };
};
