// Mobile flag mode toggle button component

import React from 'react';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';

interface FlagModeButtonProps {
  isActive: boolean;
  onToggle: () => void;
}

const FlagModeButton: React.FC<FlagModeButtonProps> = ({ isActive, onToggle }) => {
  return (
    <motion.button
      onClick={onToggle}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full font-bold text-sm shadow-lg transition-all duration-200 ${
        isActive
          ? 'bg-yellow-500 text-yellow-900 shadow-yellow-500/50'
          : 'bg-white/10 text-white/70 backdrop-blur-sm border border-white/20'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={isActive ? { rotate: [0, -10, 10, -10, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Flag className="w-5 h-5" />
        </motion.div>
        <span>{isActive ? 'Flag Mode ON' : 'Tap for Flag Mode'}</span>
      </div>
    </motion.button>
  );
};

export default FlagModeButton;
