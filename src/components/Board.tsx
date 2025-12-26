import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cell from './Cell';
import { GameState, GameStatus } from '../utils/gameLogic';

interface BoardProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number, e: React.MouseEvent) => void;
  onCellDoubleClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onCellClick, onCellRightClick, onCellDoubleClick }) => {
  const { board, rows, cols, status } = gameState;
  const prevStatusRef = useRef<GameStatus>(status);

  // Enhanced shake animation for loss state
  const shakeVariants = {
    normal: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      rotate: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    },
    shake: {
      opacity: 1,
      scale: 1,
      x: [0, -15, 15, -15, 15, -10, 10, -5, 5, 0],
      y: [0, -5, 5, -5, 5, -3, 3, -1, 1, 0],
      rotate: [0, -2, 2, -2, 2, -1, 1, -0.5, 0.5, 0],
      transition: { duration: 0.6 }
    }
  };

  // Victory celebration animation
  const victoryVariants = {
    normal: {
      scale: 1,
      rotate: 0,
    },
    celebrate: {
      scale: [1, 1.05, 1.02, 1.05, 1],
      rotate: [0, -2, 2, -1, 0],
      transition: { duration: 0.8, times: [0, 0.25, 0.5, 0.75, 1] }
    }
  };

  // Detect status changes
  useEffect(() => {
    if (prevStatusRef.current !== 'lost' && status === 'lost') {
      // Just lost - trigger additional effects if needed
      console.log('Game lost!');
    }
    if (prevStatusRef.current !== 'won' && status === 'won') {
      // Just won - trigger additional effects if needed
      console.log('Game won!');
    }
    prevStatusRef.current = status;
  }, [status]);

  const getBoardAnimation = () => {
    if (status === 'lost') return 'shake';
    if (status === 'won') return 'celebrate';
    return 'normal';
  };

  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-md border-2 rounded-2xl shadow-2xl p-4 sm:p-6 relative ${
        status === 'lost' 
          ? 'border-red-500/50 shadow-red-500/20' 
          : status === 'won'
          ? 'border-yellow-500/50 shadow-yellow-500/20'
          : 'border-white/30 shadow-black/30'
      }`}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{ position: 'relative', zIndex: 10 }}
    >
      {/* Board container with shake/victory animation */}
      <motion.div
        animate={getBoardAnimation()}
        variants={status === 'won' ? victoryVariants : shakeVariants}
      >
        <div 
          className="grid gap-1 sm:gap-2"
          style={{ 
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` 
          }}
        >
          <AnimatePresence mode="popLayout">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <motion.div
                  key={`${rowIndex}-${colIndex}-${cell.isRevealed}-${cell.isFlagged}-${status}`}
                  layout
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                    delay: cell.isRevealed ? 0 : 0
                  }}
                >
                  <Cell
                    cell={cell}
                    onClick={() => onCellClick(rowIndex, colIndex)}
                    onRightClick={(e) => onCellRightClick(rowIndex, colIndex, e)}
                    onDoubleClick={() => onCellDoubleClick(rowIndex, colIndex)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Victory overlay effect */}
      {status === 'won' && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 1, times: [0, 0.5, 1] }}
          style={{
            background: 'radial-gradient(circle, rgba(250,204,21,0.2) 0%, transparent 70%)',
          }}
        />
      )}

      {/* Defeat overlay effect */}
      {status === 'lost' && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0.2] }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'radial-gradient(circle, rgba(239,68,68,0.3) 0%, transparent 70%)',
          }}
        />
      )}
    </motion.div>
  );
};

export default Board;
