import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cell from './Cell';
import { GameState } from '../utils/gameLogic';

interface BoardProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number, e: React.MouseEvent) => void;
  onCellDoubleClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ gameState, onCellClick, onCellRightClick, onCellDoubleClick }) => {
  const { board, rows, cols, status } = gameState;
  console.log('Board render:', { status, boardLength: board.length, rows, cols });
  console.log('Board container should be visible:', status !== 'idle');

  // Shake animation for loss state
  const shakeVariants = {
    normal: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    },
    shake: {
      opacity: 1,
      scale: 1,
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-md border-2 border-white/30 rounded-2xl shadow-2xl shadow-black/30 p-4 sm:p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={gameState.status === 'lost' ? 'shake' : 'normal'}
      variants={shakeVariants}
      style={{ position: 'relative', zIndex: 10 }}
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
                key={`${rowIndex}-${colIndex}-${cell.isRevealed}-${cell.isFlagged}`}
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
  );
};

export default Board;
