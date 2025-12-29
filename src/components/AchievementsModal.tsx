// Achievements modal component

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Lock } from 'lucide-react';
import { Achievement, AchievementID } from '../types/achievements';
import { getRarityColor } from '../utils/achievements';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Record<AchievementID, Achievement>;
  totalUnlocked: number;
}

const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  totalUnlocked,
}) => {
  // Group by rarity
  const groupedAchievements = useMemo(() => {
    const groups: Record<string, Achievement[]> = {
      common: [],
      rare: [],
      epic: [],
      legendary: [],
    };

    Object.values(achievements).forEach((achievement) => {
      groups[achievement.rarity].push(achievement);
    });

    return groups;
  }, [achievements]);

  const rarityOrder: Array<'common' | 'rare' | 'epic' | 'legendary'> = ['common', 'rare', 'epic', 'legendary'];
  const totalAchievements = Object.values(achievements).length;
  const completionPercentage = Math.round((totalUnlocked / totalAchievements) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-black/30 p-6 max-w-3xl w-full max-h-[85vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Trophy className="w-7 h-7 text-yellow-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Achievements</h2>
                  <p className="text-white/60 text-sm">
                    {totalUnlocked} / {totalAchievements} Unlocked ({completionPercentage}%)
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Achievements List */}
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar -mr-2">
              {rarityOrder.map((rarity) => {
                const achievements = groupedAchievements[rarity];
                const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);

                return (
                  <div key={rarity}>
                    <h3 className={`font-bold text-lg mb-2 ${getRarityColor(rarity).split(' ').pop()}`}>
                      {rarityLabel}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {achievements.map((achievement) => {
                        const colors = getRarityColor(achievement.rarity);
                        const isUnlocked = achievement.unlocked;

                        return (
                          <motion.div
                            key={achievement.id}
                            className={`relative rounded-lg p-4 border transition-all duration-200 ${
                              isUnlocked
                                ? `${colors} cursor-pointer hover:scale-105`
                                : 'bg-white/5 border-white/10 opacity-50'
                            }`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            whileHover={isUnlocked ? { scale: 1.02 } : {}}
                          >
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                                isUnlocked
                                  ? 'bg-gradient-to-br from-white/20 to-white/5'
                                  : 'bg-white/5'
                              }`}>
                                {isUnlocked ? achievement.icon : <Lock className="w-6 h-6 text-white/30" />}
                              </div>

                              {/* Content */}
                              <div className="flex-1">
                                <h4 className={`font-semibold ${isUnlocked ? 'text-white' : 'text-white/50'}`}>
                                  {achievement.name}
                                </h4>
                                <p className={`text-sm ${isUnlocked ? 'text-white/70' : 'text-white/40'}`}>
                                  {achievement.description}
                                </p>

                                {/* Progress bar */}
                                {achievement.maxProgress !== undefined && (
                                  <div className="mt-2">
                                    <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                                      <span>Progress</span>
                                      <span>
                                        {achievement.progress} / {achievement.maxProgress}
                                      </span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-cyan-400"
                                        style={{
                                          width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Unlocked date */}
                                {isUnlocked && achievement.unlockedAt && (
                                  <p className="text-xs text-white/40 mt-2">
                                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="w-full mt-6 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold py-3 rounded-lg transition-all duration-200 flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AchievementsModal;
