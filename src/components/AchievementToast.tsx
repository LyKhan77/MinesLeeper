// Achievement toast notification component

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { Achievement } from '../types/achievements';
import { getRarityColor } from '../utils/achievements';

interface AchievementToastProps {
  achievement: Achievement | null;
  show: boolean;
  onHide: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, show, onHide }) => {
  if (!achievement) return null;

  const rarityColor = getRarityColor(achievement.rarity);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className={`bg-gradient-to-r ${rarityColor.split(' ')[0]} to-transparent backdrop-blur-md border ${rarityColor.split(' ')[1]} rounded-xl shadow-2xl p-4 max-w-md`}>
            <div className="flex items-center gap-4">
              {/* Icon */}
              <motion.div
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-3xl shadow-lg"
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                }}
              >
                {achievement.icon}
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider">
                    Achievement Unlocked!
                  </span>
                </div>
                <h3 className={`font-bold text-lg ${rarityColor.split(' ').pop()}`}>
                  {achievement.name}
                </h3>
                <p className="text-white/70 text-sm">
                  {achievement.description}
                </p>
              </div>

              {/* Close button */}
              <motion.button
                onClick={onHide}
                className="text-white/50 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Progress bar (if applicable) */}
            {achievement.maxProgress !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                  <span>Progress</span>
                  <span>{achievement.progress} / {achievement.maxProgress}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 rounded-xl"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
              }}
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementToast;
