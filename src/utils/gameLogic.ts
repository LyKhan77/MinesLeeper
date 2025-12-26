// src/utils/gameLogic.ts

import { Cell, Board, GameState, GameStatus } from '../types';

// Re-export types for convenience
export type { Cell, Board, GameState, GameStatus };

// --- DIRECTIONS FOR NEIGHBOR CHECKS ---
const MOVES = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

/**
 * 1. INITIALIZATION
 * Creates an empty board structure (no mines yet).
 */
export const createEmptyBoard = (rows: number, cols: number, totalMines: number): GameState => {
  const board: Board = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      row: r,
      col: c,
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
    }))
  );

  return {
    board,
    status: 'idle',
    rows,
    cols,
    totalMines,
    flagsUsed: 0,
  };
};

/**
 * 2. MINE GENERATION (First Click Safe)
 * Places mines *after* the first click to ensure the starting area is clear.
 */
const placeMines = (
  board: Board, 
  rows: number, 
  cols: number, 
  mines: number, 
  safeRow: number, 
  safeCol: number
): Board => {
  const newBoard = deepCloneBoard(board);
  let minesPlaced = 0;

  while (minesPlaced < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    // Safety Check: Don't place mine on the first clicked cell OR its neighbors
    // This ensures the first click is always a '0' (an opening).
    const isSafeZone = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;

    if (!newBoard[r][c].isMine && !isSafeZone) {
      newBoard[r][c].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate numbers for all cells after mines are set
  return calculateNeighborCounts(newBoard, rows, cols);
};

const calculateNeighborCounts = (board: Board, rows: number, cols: number): Board => {
  const newBoard = deepCloneBoard(board);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) continue;

      let count = 0;
      MOVES.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
          count++;
        }
      });
      newBoard[r][c].neighborCount = count;
    }
  }
  return newBoard;
};

/**
 * 3. MAIN ACTION: REVEAL CELL
 * Handles the logic for clicking a cell.
 */
export const revealCell = (gameState: GameState, row: number, col: number): GameState => {
  let { board, status, rows, cols, totalMines } = gameState;

  // Guard Clauses
  if (status === 'won' || status === 'lost') return gameState;
  if (board[row][col].isRevealed || board[row][col].isFlagged) return gameState;

  // A. Handle First Click (Generate Mines now)
  if (status === 'idle') {
    board = placeMines(board, rows, cols, totalMines, row, col);
    status = 'playing';
  } else {
    // Clone board to ensure immutability
    board = deepCloneBoard(board);
  }

  const cell = board[row][col];

  // B. Handle Mine Click (Loss)
  if (cell.isMine) {
    cell.isRevealed = true;
    return { ...gameState, board, status: 'lost' };
  }

  // C. Handle Normal Reveal (Flood Fill if 0)
  const newBoard = floodFillReveal(board, row, col, rows, cols);
  
  // D. Check Win Condition
  const newStatus = checkWin(newBoard, rows, cols, totalMines) ? 'won' : status;

  return {
    ...gameState,
    board: newBoard,
    status: newStatus,
  };
};

/**
 * 4. FLOOD FILL (Iterative Stack-Based)
 * If you click a '0', this opens all connected '0's and their number neighbors.
 */
const floodFillReveal = (board: Board, startRow: number, startCol: number, rows: number, cols: number): Board => {
  const stack = [[startRow, startCol]];

  while (stack.length > 0) {
    const [r, c] = stack.pop()!;
    const current = board[r][c];

    if (current.isRevealed || current.isFlagged) continue;

    current.isRevealed = true;

    // If it's a '0' cell (empty), add neighbors to stack
    if (current.neighborCount === 0) {
      MOVES.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (!board[nr][nc].isRevealed) {
            stack.push([nr, nc]);
          }
        }
      });
    }
  }
  return board;
};

/**
 * 5. TOGGLE FLAG
 */
export const toggleFlag = (gameState: GameState, row: number, col: number): GameState => {
  if (gameState.status !== 'playing' && gameState.status !== 'idle') return gameState;
  
  const board = deepCloneBoard(gameState.board);
  const cell = board[row][col];

  if (cell.isRevealed) return gameState;

  cell.isFlagged = !cell.isFlagged;

  return {
    ...gameState,
    board,
    flagsUsed: gameState.flagsUsed + (cell.isFlagged ? 1 : -1),
  };
};

/**
 * 6. CHORDING (Smart Reveal)
 * If you click a number that is already revealed, and it has the correct 
 * number of flags around it, reveal the neighbors.
 */
export const chordReveal = (gameState: GameState, row: number, col: number): GameState => {
  if (gameState.status !== 'playing') return gameState;

  const { board, rows, cols } = gameState;
  const cell = board[row][col];

  if (!cell.isRevealed || cell.neighborCount === 0) return gameState;

  // Count flags around
  let flagCount = 0;
  MOVES.forEach(([dr, dc]) => {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].isFlagged) {
      flagCount++;
    }
  });

  // If flags match neighbor count, trigger reveal on neighbors
  if (flagCount === cell.neighborCount) {
    let newState = { ...gameState };
    
    // We must process neighbors carefully to capture Game Over scenarios
    // We iterate manually to chain the state updates
    for (const [dr, dc] of MOVES) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            const neighbor = newState.board[nr][nc];
            if (!neighbor.isRevealed && !neighbor.isFlagged) {
               newState = revealCell(newState, nr, nc);
               if (newState.status === 'lost') break;
            }
        }
    }
    return newState;
  }

  return gameState;
};

// --- UTILS ---

const checkWin = (board: Board, rows: number, cols: number, totalMines: number): boolean => {
  let revealedCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].isRevealed) revealedCount++;
    }
  }
  // You win if all non-mine cells are revealed
  return revealedCount === (rows * cols - totalMines);
};

const deepCloneBoard = (board: Board): Board => {
  return board.map(row => row.map(cell => ({ ...cell })));
};
