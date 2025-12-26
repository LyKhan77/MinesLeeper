import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Clock, Calendar, Medal } from 'lucide-react';
import { Difficulty, HighScoreEntry } from '../types';
import { formatTime, formatDate } from '../utils/storage';

interface HighScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  highScores: Record<Difficulty, HighScoreEntry[]>;
}

const difficultyColors: Record<Difficulty, string> = {
  beginner: 'text-emerald-400',
  intermediate: 'text-yellow-400',
  expert: 'text-red-400',
};

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

const HighScoreModal: React.FC<HighScoreModalProps> = ({ isOpen, onClose, highScores }) => {
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
                <Trophy className="w-7 h-7 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">High Scores</h2>
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
            <div className="space-y-6 overflow-y-auto flex-1 pr-2 custom-scrollbar -mr-2">
              {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((difficulty) => {
                const scores = highScores[difficulty];
                
                return (
                  <motion.div
                    key={difficulty}
                    className="bg-white/5 rounded-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: difficulty === 'beginner' ? 0.1 : difficulty === 'intermediate' ? 0.2 : 0.3 }}
                  >
                    {/* Difficulty Header */}
                    <div className={`px-4 py-3 bg-gradient-to-r from-white/10 to-white/5 border-b border-white/10`}>
                      <h3 className={`font-bold ${difficultyColors[difficulty]} flex items-center gap-2`}>
                        <Medal className="w-5 h-5" />
                        {difficultyLabels[difficulty]}
                      </h3>
                    </div>

                    {/* Scores List */}
                    <div className="p-4">
                      {scores.length === 0 ? (
                        <p className="text-white/40 text-sm text-center py-4">
                          No scores yet. Be the first!
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {scores.map((entry, index) => (
                            <motion.div
                              key={index}
                              className={`flex items-center justify-between p-3 rounded-lg ${
                                index === 0
                                  ? 'bg-gradient-to-r from-yellow-500/20 to-transparent border border-yellow-500/20'
                                  : index === 1
                                  ? 'bg-gradient-to-r from-gray-400/20 to-transparent border border-gray-400/20'
                                  : index === 2
                                  ? 'bg-gradient-to-r from-orange-400/20 to-transparent border border-orange-400/20'
                                  : 'bg-white/5'
                              }`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              {/* Rank */}
                              <div className="flex items-center gap-3 flex-1">
                                <span
                                  className={`font-bold text-lg w-8 ${
                                    index === 0
                                      ? 'text-yellow-400'
                                      : index === 1
                                      ? 'text-gray-300'
                                      : index === 2
                                      ? 'text-orange-400'
                                      : 'text-white/40'
                                  }`}
                                >
                                  #{index + 1}
                                </span>
                                <span className="text-white font-medium">{entry.name}</span>
                              </div>

                              {/* Stats */}
                              <div className="flex items-center gap-4 text-white/70">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span className="font-mono">{formatTime(entry.time)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span className="text-sm">{formatDate(entry.date)}</span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
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

export default HighScoreModal;
