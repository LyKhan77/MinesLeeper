import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';

interface NameInputModalProps {
  isOpen: boolean;
  onSave: (name: string) => void;
}

const NameInputModal: React.FC<NameInputModalProps> = ({ isOpen, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (trimmed.length > 20) {
      setError('Name must be less than 20 characters');
      return;
    }
    onSave(trimmed);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-black/30 p-8 max-w-md w-full"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Icon */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-cyan-300" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-3xl font-bold text-white text-center mb-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Welcome!
            </motion.h2>

            <motion.p
              className="text-white/70 text-center mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Enter your name to start your MinesLeeper journey
            </motion.p>

            {/* Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative mb-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Your name..."
                  maxLength={20}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  autoFocus
                />
                <motion.div
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  animate={{ rotate: name ? 360 : 0 }}
                >
                  <Sparkles className={`w-5 h-5 ${name ? 'text-yellow-400' : 'text-white/20'}`} />
                </motion.div>
              </div>

              {error && (
                <motion.p
                  className="text-red-400 text-sm mb-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              {/* Character count */}
              <p className="text-white/40 text-xs text-right mb-4">
                {name.length}/20 characters
              </p>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={name.trim().length < 2}
                className={`w-full font-semibold py-3 rounded-lg transition-all duration-200 ${
                  name.trim().length >= 2
                    ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 text-cyan-300 hover:from-cyan-500/40 hover:to-purple-500/40'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
                whileHover={name.trim().length >= 2 ? { scale: 1.02 } : {}}
                whileTap={name.trim().length >= 2 ? { scale: 0.98 } : {}}
              >
                Start Playing
              </motion.button>
            </motion.div>

            {/* Footer note */}
            <motion.p
              className="text-white/40 text-xs text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              You can change your name later in settings
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NameInputModal;
