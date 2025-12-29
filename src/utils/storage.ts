// LocalStorage utilities for MinesLeeper

import { PlayerData, HighScoreEntry, GameStats, DailyChallengeState, Difficulty } from '../types';

const STORAGE_KEY = 'minesleeper-data';

const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  gamesWon: 0,
  gamesLost: 0,
  bestTimes: {
    beginner: null,
    intermediate: null,
    expert: null,
  },
  currentStreak: 0,
  longestStreak: 0,
};

const DEFAULT_PLAYER_DATA: PlayerData = {
  name: '',
  highScores: {
    beginner: [],
    intermediate: [],
    expert: [],
  },
  stats: DEFAULT_STATS,
  dailyChallenge: {
    date: new Date().toISOString().split('T')[0],
    completed: false,
    time: null,
    streak: 0,
  },
};

// Get player data from localStorage
export const getPlayerData = (): PlayerData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return { ...DEFAULT_PLAYER_DATA, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return DEFAULT_PLAYER_DATA;
};

// Save player data to localStorage
export const savePlayerData = (data: PlayerData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Check if player has a name
export const hasPlayerName = (): boolean => {
  const data = getPlayerData();
  return data.name.trim().length > 0;
};

// Set player name
export const setPlayerName = (name: string): void => {
  const data = getPlayerData();
  data.name = name.trim();
  savePlayerData(data);
};

// Add high score
export const addHighScore = (difficulty: Difficulty, time: number): void => {
  const data = getPlayerData();
  const entry: HighScoreEntry = {
    name: data.name,
    time,
    date: new Date().toISOString(),
    difficulty,
  };

  data.highScores[difficulty].push(entry);
  // Sort by time (ascending) and keep top 10
  data.highScores[difficulty].sort((a, b) => a.time - b.time);
  data.highScores[difficulty] = data.highScores[difficulty].slice(0, 10);

  savePlayerData(data);
};

// Get high scores for difficulty
export const getHighScores = (difficulty: Difficulty): HighScoreEntry[] => {
  const data = getPlayerData();
  return data.highScores[difficulty];
};

// Update game stats after a game
export const updateGameStats = (
  won: boolean,
  difficulty: Difficulty,
  time: number
): void => {
  const data = getPlayerData();
  
  data.stats.totalGames++;
  if (won) {
    data.stats.gamesWon++;
    data.stats.currentStreak++;
    if (data.stats.currentStreak > data.stats.longestStreak) {
      data.stats.longestStreak = data.stats.currentStreak;
    }
    // Update best time
    const currentBest = data.stats.bestTimes[difficulty];
    if (currentBest === null || time < currentBest) {
      data.stats.bestTimes[difficulty] = time;
    }
    // Add to high scores
    addHighScore(difficulty, time);
  } else {
    data.stats.gamesLost++;
    data.stats.currentStreak = 0;
  }

  savePlayerData(data);
};

// Get game stats
export const getGameStats = (): GameStats => {
  const data = getPlayerData();
  return data.stats;
};

// Daily Challenge functions
export const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDailyChallengeState = (): DailyChallengeState => {
  const data = getPlayerData();
  const today = getTodayDate();

  // Reset if it's a new day
  if (data.dailyChallenge.date !== today) {
    data.dailyChallenge = {
      date: today,
      completed: false,
      time: null,
      streak: data.dailyChallenge.completed ? data.dailyChallenge.streak : 0,
    };
    savePlayerData(data);
  }

  return data.dailyChallenge;
};

export const completeDailyChallenge = (time: number): void => {
  const data = getPlayerData();
  const today = getTodayDate();

  if (data.dailyChallenge.date !== today) {
    data.dailyChallenge.date = today;
  }

  if (!data.dailyChallenge.completed) {
    data.dailyChallenge.completed = true;
    data.dailyChallenge.time = time;
    data.dailyChallenge.streak++;
    savePlayerData(data);
  }
};

// Get win rate percentage
export const getWinRate = (): number => {
  const stats = getGameStats();
  if (stats.totalGames === 0) return 0;
  return Math.round((stats.gamesWon / stats.totalGames) * 100);
};

// Format time for display
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Format date for display
export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Generate daily seed based on date
export const generateDailySeed = (date: string): number => {
  // Simple hash of date string
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    const char = date.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

// Get time until next day reset (in seconds)
export const getTimeUntilReset = (): number => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
};

// Clear all data (for testing/reset)
export const clearAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY); // Remove player data, stats, high scores
  localStorage.removeItem('minesleeper-achievements'); // Remove achievements
  localStorage.removeItem('minesleeper-sound-enabled'); // Reset sound preference
  localStorage.removeItem('minesleeper-sound-volume'); // Reset sound volume
};
