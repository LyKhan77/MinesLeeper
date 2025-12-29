import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Trophy, Target, Flame, Gamepad2, RotateCcw, Trash2 } from 'lucide-react';
import { GameStats as GameStatsType, Difficulty } from '../types';
import { formatTime, clearAllData } from '../utils/storage';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStatsType;
  onReset?: () => void;
}

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats, onReset }) => {
  const winRate = stats.totalGames > 0 ? Math.round((stats.gamesWon / stats.totalGames) * 100) : 0;

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all statistics? This will delete all your game data including high scores and achievements.')) {
      clearAllData();
      window.location.reload(); // Reload to refresh data
    }
  };

  const statCards = [
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      label: 'Total Games',
      value: stats.totalGames,
      color: 'from-blue-500/20 to-blue-600/20',
      textColor: 'text-blue-400',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      label: 'Games Won',
      value: stats.gamesWon,
      color: 'from-yellow-500/20 to-yellow-600/20',
      textColor: 'text-yellow-400',
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: 'Win Rate',
      value: `${winRate}%`,
      color: 'from-emerald-500/20 to-emerald-600/20',
      textColor: 'text-emerald-400',
    },
    {
      icon: <Flame className="w-6 h-6" />,
      label: 'Current Streak',
      value: stats.currentStreak,
      color: 'from-orange-500/20 to-orange-600/20',
      textColor: 'text-orange-400',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      label: 'Longest Streak',
      value: stats.longestStreak,
      color: 'from-purple-500/20 to-purple-600/20',
      textColor: 'text-purple-400',
    },
  ];

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
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-black/30 p-6 max-w-2xl w-full max-h-[85vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-purple-400" />
                <h2 className="text-2xl font-bold text-white">Statistics</h2>
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

            {/* Content */}
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar -mr-2">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {statCards.map((card, index) => (
                  <motion.div
                    key={card.label}
                    className={`bg-gradient-to-br ${card.color} rounded-lg p-4 border border-white/10`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {card.icon}
                      <p className="text-white/60 text-xs">{card.label}</p>
                    </div>
                    <p className={`text-2xl font-bold ${card.textColor}`}>
                      {card.value}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Best Times */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Best Times
                </h3>
                <div className="space-y-3">
                  {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((difficulty, index) => (
                    <motion.div
                      key={difficulty}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <span className="text-white/80">{difficultyLabels[difficulty]}</span>
                      {stats.bestTimes[difficulty] ? (
                        <span className="font-mono text-cyan-300 text-lg">
                          {formatTime(stats.bestTimes[difficulty]!)}
                        </span>
                      ) : (
                        <span className="text-white/40 text-sm">--:--</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Games Lost Counter */}
              {stats.gamesLost > 0 && (
                <motion.div
                  className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <p className="text-red-300 text-sm">
                    Games Lost: <span className="font-bold">{stats.gamesLost}</span>
                  </p>
                  <p className="text-red-300/60 text-xs mt-1">
                    Don't give up! Every loss is a step closer to victory.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Reset Stats Button */}
            <motion.button
              onClick={handleReset}
              className="w-full mt-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash2 className="w-4 h-4" />
              Reset All Statistics
            </motion.button>

            {/* Close Button */}
            <motion.button
              onClick={onClose}
              className="w-full mt-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold py-3 rounded-lg transition-all duration-200 flex-shrink-0"
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

export default StatsModal;
