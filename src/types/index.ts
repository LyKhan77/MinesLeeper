// Game types and interfaces

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';
export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

export type Board = Cell[][];

export interface GameState {
  board: Board;
  status: GameStatus;
  rows: number;
  cols: number;
  totalMines: number;
  flagsUsed: number;
}

export interface HighScoreEntry {
  name: string;
  time: number; // in seconds
  date: string; // ISO date string
  difficulty: Difficulty;
}

export interface GameStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  bestTimes: Record<Difficulty, number | null>;
  currentStreak: number;
  longestStreak: number;
}

export interface DailyChallengeState {
  date: string; // YYYY-MM-DD
  completed: boolean;
  time: number | null;
  streak: number;
}

export interface PlayerData {
  name: string;
  highScores: Record<Difficulty, HighScoreEntry[]>;
  stats: GameStats;
  dailyChallenge: DailyChallengeState;
}
