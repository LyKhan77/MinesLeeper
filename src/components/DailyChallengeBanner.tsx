import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Flame, CheckCircle2 } from 'lucide-react';
import { getTimeUntilReset, formatTime } from '../utils/storage';
import { DailyChallengeState } from '../types';

interface DailyChallengeBannerProps {
  challenge: DailyChallengeState;
  onClick: () => void;
}

const DailyChallengeBanner: React.FC<DailyChallengeBannerProps> = ({ challenge, onClick }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilReset());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilReset());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTimeLeft = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      onClick={onClick}
      className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/20 rounded-lg p-4 mb-4 cursor-pointer hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Challenge info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="w-8 h-8 text-purple-300" />
            {challenge.completed && (
              <motion.div
                className="absolute -top-1 -right-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </motion.div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              Daily Challenge
              {challenge.completed && (
                <motion.span
                  className="text-xs bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  Completed
                </motion.span>
              )}
            </h3>
            {challenge.completed ? (
              <p className="text-white/70 text-sm">
                Time: <span className="font-mono text-cyan-300">{formatTime(challenge.time!)}</span>
              </p>
            ) : (
              <p className="text-white/70 text-sm">
                Complete today's challenge to keep your streak!
              </p>
            )}
          </div>
        </div>

        {/* Right side - Streak & Timer */}
        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-orange-400">
              <Flame className="w-5 h-5" />
              <span className="font-bold text-lg">{challenge.streak}</span>
            </div>
            <p className="text-white/50 text-xs">Streak</p>
          </div>

          {/* Timer */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-purple-300">
              <Clock className="w-5 h-5" />
              <span className="font-mono text-sm">{formatTimeLeft(timeLeft)}</span>
            </div>
            <p className="text-white/50 text-xs">Until reset</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyChallengeBanner;
