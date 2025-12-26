import React, { useEffect, useRef } from 'react';
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
  const sparkleRef = useRef<HTMLDivElement>(null);
  
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
  const baseClasses = 'w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-bold select-none transition-all duration-200 cursor-pointer relative overflow-hidden';

  // Hidden cell styles (glass effect)
  const hiddenClasses = 'bg-white/10 hover:bg-white/20 border border-white/5 hover:shadow-lg hover:shadow-white/10 hover:animate-pulse-glow';

  // Revealed cell styles (recessed look)
  const revealedClasses = 'bg-slate-800/50 border border-white/5 shadow-inner';

  // Flagged cell animation
  const flagVariants = {
    flag: {
      scale: [1, 0.8, 1],
      rotate: [0, -5, 5, -5, 0],
      transition: { duration: 0.3 }
    }
  };

  // Reveal animation
  const revealVariants = {
    hidden: { 
      scale: 0,
      rotate: -180,
    },
    visible: { 
      scale: 1,
      rotate: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  // Explosion animation
  const explosionVariants = {
    explode: {
      scale: [1, 1.5, 1],
      backgroundColor: [
        'rgba(239, 68, 68, 0)',
        'rgba(239, 68, 68, 0.5)',
        'rgba(239, 68, 68, 0)',
      ],
      transition: { duration: 0.5 }
    }
  };

  // Create sparkle effect on reveal
  useEffect(() => {
    if (cell.isRevealed && !cell.isMine && sparkleRef.current) {
      // Create sparkle particles
      Array.from({ length: 5 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 5;
        const distance = 15;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        const sparkle = document.createElement('div');
        sparkle.className = 'absolute w-1 h-1 bg-cyan-300 rounded-full';
        sparkle.style.left = '50%';
        sparkle.style.top = '50%';
        sparkle.style.transform = 'translate(-50%, -50%)';

        sparkleRef.current?.appendChild(sparkle);

        // Animate using Web Animations API
        sparkle.animate([
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(0)`, opacity: 0 }
        ], {
          duration: 600,
          easing: 'ease-out',
        }).onfinish = () => sparkle.remove();

        return sparkle;
      });
    }
  }, [cell.isRevealed, cell.isMine]);

  return (
    <motion.div
      className={`${baseClasses} ${cell.isRevealed ? revealedClasses : hiddenClasses}`}
      onClick={onClick}
      onContextMenu={onRightClick}
      onDoubleClick={onDoubleClick}
      variants={cell.isRevealed ? revealVariants : undefined}
      initial={cell.isRevealed ? 'hidden' : undefined}
      animate={cell.isRevealed ? 'visible' : undefined}
      whileHover={!cell.isRevealed ? { 
        scale: 1.05,
        boxShadow: '0 0 15px rgba(255, 255, 255, 0.3)'
      } : undefined}
      whileTap={!cell.isRevealed ? { scale: 0.95 } : undefined}
    >
      {/* Sparkle container */}
      <div ref={sparkleRef} className="absolute inset-0 pointer-events-none" />

      {/* Pulse glow effect for hidden cells */}
      {!cell.isRevealed && !cell.isFlagged && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 rounded"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {cell.isFlagged && !cell.isRevealed && (
        <motion.div
          variants={flagVariants}
          animate="flag"
          key={`flag-${cell.row}-${cell.col}-${cell.isFlagged}`}
        >
          <Flag className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
        </motion.div>
      )}

      {cell.isRevealed && cell.isMine && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 bg-red-500/30 rounded"
            variants={explosionVariants}
            animate="explode"
          />
          <Bomb className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,1)] relative z-10" />
        </motion.div>
      )}

      {cell.isRevealed && !cell.isMine && cell.neighborCount > 0 && (
        <motion.span
          initial={{ scale: 0, rotate: -90 }}
          animate={{ 
            scale: 1, 
            rotate: 0,
            textShadow: [
              '0 0 8px currentColor',
              '0 0 16px currentColor',
              '0 0 8px currentColor',
            ]
          }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 20,
            textShadow: {
              repeat: Infinity,
              duration: 2,
            }
          }}
          className={getNumberColor(cell.neighborCount)}
        >
          {cell.neighborCount}
        </motion.span>
      )}
    </motion.div>
  );
};

export default Cell;
