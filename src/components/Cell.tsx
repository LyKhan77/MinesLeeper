import React from 'react';
import { motion } from 'framer-motion';
import { Flag, Bomb } from 'lucide-react';
import { Cell as CellType } from '../utils/gameLogic';

interface CellProps {
  cell: CellType;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}

const Cell: React.FC<CellProps> = ({ cell, onClick, onRightClick, onDoubleClick }) => {
  console.log('Cell render:', { row: cell.row, col: cell.col, isMine: cell.isMine, isRevealed: cell.isRevealed, isFlagged: cell.isFlagged, neighborCount: cell.neighborCount });
  
  // Number color mapping with glow effects
  const getNumberColor = (num: number): string => {
    const colors: Record<number, string> = {
      1: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
      2: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]',
      3: 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]',
      4: 'text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]',
      5: 'text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]',
      6: 'text-teal-400 drop-shadow-[0_0_8px_rgba(45,212,191,0.8)]',
      7: 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.8)]',
      8: 'text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]',
    };
    return colors[num] || 'text-white';
  };

  // Base cell styles
  const baseClasses = 'w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-bold select-none transition-all duration-200 cursor-pointer';

  // Hidden cell styles (glass effect)
  const hiddenClasses = 'bg-white/10 hover:bg-white/20 border border-white/5 hover:shadow-lg hover:shadow-white/10';

  // Revealed cell styles (recessed look)
  const revealedClasses = 'bg-slate-800/50 border border-white/5 shadow-inner';

  // Flagged cell animation
  const flagVariants = {
    flag: {
      scale: [1, 0.8, 1],
      transition: { duration: 0.15 }
    }
  };

  // Reveal animation
  const revealVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  return (
    <motion.div
      className={`${baseClasses} ${cell.isRevealed ? revealedClasses : hiddenClasses} ${cell.isFlagged ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onContextMenu={onRightClick}
      onDoubleClick={onDoubleClick}
      variants={cell.isRevealed ? revealVariants : undefined}
      initial={cell.isRevealed ? 'hidden' : undefined}
      animate={cell.isRevealed ? 'visible' : undefined}
      whileHover={!cell.isRevealed ? { scale: 1.05 } : undefined}
      whileTap={!cell.isRevealed ? { scale: 0.95 } : undefined}
    >
      {cell.isFlagged && !cell.isRevealed && (
        <motion.div
          variants={flagVariants}
          animate="flag"
          key={`flag-${cell.row}-${cell.col}-${cell.isFlagged}`}
        >
          <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
        </motion.div>
      )}

      {cell.isRevealed && cell.isMine && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <Bomb className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,1)]" />
        </motion.div>
      )}

      {cell.isRevealed && !cell.isMine && cell.neighborCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={getNumberColor(cell.neighborCount)}
        >
          {cell.neighborCount}
        </motion.span>
      )}
    </motion.div>
  );
};

export default Cell;
