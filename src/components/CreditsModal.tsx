import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gamepad2, Lightbulb } from 'lucide-react';
// @ts-ignore - PNG import
import leeImage from '../assets/lee.png';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
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
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-black/30 p-6 max-w-md w-full max-h-[85vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Credits</h2>
              <motion.button
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Developer Info */}
            <div className="flex flex-col items-center mb-6">
              <motion.div
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-cyan-400/50 mb-4 shadow-lg shadow-cyan-400/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <img
                  src={leeImage}
                  alt="Kang Lee"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <h3 className="text-xl font-bold text-cyan-300 mb-1">Kang Lee</h3>
              <p className="text-white/60 text-sm">Developer & Designer</p>
            </div>

            {/* Story Section */}
            <div className="space-y-4 text-white/90 overflow-y-auto flex-1 pr-2 custom-scrollbar -mr-2">
              <motion.div
                className="bg-white/5 rounded-lg p-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  <h4 className="font-semibold text-yellow-300">The Origin Story</h4>
                </div>
                <p className="text-sm leading-relaxed">
                  One quiet night, when the world was asleep, I was struck by an existential question that shook the very foundation of my humanity:
                </p>
                <p className="text-sm font-semibold text-cyan-300 mt-2 italic">
                  "What if Minesweeper... but aesthetic?"
                </p>
                <p className="text-sm leading-relaxed mt-2">
                  From a complete disregard for healthy sleep habits, <span className="text-cyan-300 font-semibold">MinesLeeper</span> was born. A celebration for those souls who refuse to sleep early just to click mysterious boxes.
                </p>
                <p className="text-sm text-white/60 mt-2">
                  (Philosophy: If you can't sleep, just play.)
                </p>
              </motion.div>

              <motion.div
                className="bg-white/5 rounded-lg p-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Gamepad2 className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-purple-300">Why "MinesLeeper"?</h4>
                </div>
                <p className="text-sm leading-relaxed">
                  Because people who play Minesweeper until 3 AM aren't <span className="text-purple-300 font-semibold">"Miners"</span> anymore. They are <span className="text-purple-300 font-semibold">"Leeper"</span> — someone who SHOULD be sleeping but chooses to count bombs instead.
                </p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg p-4 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <p className="text-sm text-white/80">
                  Made with <span className="text-red-400">❤</span> and sleep deprivation
                </p>
                <p className="text-xs text-white/50 mt-1">
                  © 2025 Kang Lee — No mines were harmed in the making
                </p>
              </motion.div>
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

export default CreditsModal;
