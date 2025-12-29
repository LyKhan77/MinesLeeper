// Retro Game Over Animation Component
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bomb } from 'lucide-react';

interface GameOverAnimationProps {
  show: boolean;
  onComplete: () => void;
}

const GameOverAnimation: React.FC<GameOverAnimationProps> = ({ show, onComplete }) => {
  const [stage, setStage] = useState<'bomb' | 'shake' | 'explode' | 'done'>('bomb');
  const [showSkip, setShowSkip] = useState(true);

  useEffect(() => {
    if (!show) {
      setStage('bomb');
      setShowSkip(true);
      return;
    }

    // Stage 1: Bomb appears (0 - 0.6s)
    const bombTimer = setTimeout(() => {
      setStage('shake');

      // Stage 2: Shake build-up (0.6 - 1.2s)
      const shakeTimer = setTimeout(() => {
        setStage('explode');

        // Stage 3: Explosion (1.2 - 2.5s)
        const explodeTimer = setTimeout(() => {
          setStage('done');
          setShowSkip(false);
          onComplete();
        }, 1300);

        // Cleanup explode timer
        return () => clearTimeout(explodeTimer);
      }, 600);

      // Cleanup shake timer
      return () => clearTimeout(shakeTimer);
    }, 600);

    // Cleanup bomb timer
    return () => clearTimeout(bombTimer);
  }, [show, onComplete]);

  const handleSkip = () => {
    setStage('done');
    setShowSkip(false);
    onComplete();
  };

  // Reset stage when show changes to false
  useEffect(() => {
    if (!show) {
      setStage('bomb');
      setShowSkip(true);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && stage !== 'done' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          {/* Skip button */}
          {showSkip && (
            <motion.button
              onClick={handleSkip}
              className="fixed top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2 text-white/80 text-sm font-medium z-50"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              Skip Animation
            </motion.button>
          )}

            {/* Stage 1 & 2: Bomb appears and shakes */}
            {(stage === 'bomb' || stage === 'shake') && (
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ 
                  scale: stage === 'shake' ? [2, 2.2, 1.8, 2] : 2,
                  rotate: stage === 'shake' ? [-5, 5, -3, 3, 0] : 0,
                }}
                transition={
                  stage === 'shake'
                    ? {
                        duration: 0.6,
                        repeat: Infinity,
                        ease: 'linear',
                      }
                    : {
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      }
                }
              >
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl"
                  animate={
                    stage === 'shake'
                      ? {
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }
                      : {}
                  }
                  transition={{
                    duration: 0.3,
                    repeat: stage === 'shake' ? Infinity : 0,
                  }}
                  style={{
                    background: 'radial-gradient(circle, rgba(251, 146, 60, 0.8) 0%, transparent 70%)',
                  }}
                />

                {/* Bomb icon */}
                <Bomb className="w-32 h-32 sm:w-48 sm:h-48 text-red-500" />
              </motion.div>
            )}

            {/* Stage 3: "KAA BOOMMM!!" Explosion */}
            {stage === 'explode' && (
              <motion.div
                className="relative"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 2.5, 2],
                  opacity: [0, 1, 1, 0],
                  rotate: [-15, 10, -5, 5, 0],
                }}
                transition={{ duration: 1.3, times: [0, 0.1, 0.5, 0.7, 1] }}
              >
                {/* Starburst background */}
                <svg
                  className="absolute inset-0 w-full h-full -z-10"
                  viewBox="0 0 100 100"
                  style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  {/* Radiating lines */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * 30) * (Math.PI / 180);
                    const length = 40 + Math.random() * 20;
                    return (
                      <line
                        key={i}
                        x1="50"
                        y1="50"
                        x2={50 + Math.cos(angle) * length}
                        y2={50 + Math.sin(angle) * length}
                        stroke={i % 2 === 0 ? '#fbbf24' : '#f87171'}
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity={0.6}
                      />
                    );
                  })}
                  
                  {/* Zigzag motion lines */}
                  {[...Array(8)].map((_, i) => {
                    const angle = (i * 45) * (Math.PI / 180);
                    const points: string[] = [];
                    for (let j = 0; j < 3; j++) {
                      const r = 30 + j * 10;
                      const x = 50 + Math.cos(angle + j * 0.3) * r;
                      const y = 50 + Math.sin(angle + j * 0.3) * r;
                      points.push(`${x},${y}`);
                    }
                    return (
                      <polyline
                        key={i}
                        points={points.join(' ')}
                        fill="none"
                        stroke="#fb923c"
                        strokeWidth="2"
                        opacity={0.4}
                      />
                    );
                  })}
                </svg>

                {/* Text: "KAA BOOMMM!!" */}
                <div className="relative z-10">
                  {/* Text outline/shadow */}
                  <motion.div
                    className="text-5xl sm:text-7xl md:text-8xl font-black text-center relative"
                    animate={{
                      textShadow: [
                        '0 0 20px rgba(251, 14, 60, 0.8)',
                        '0 0 40px rgba(251, 14, 60, 1)',
                        '0 0 60px rgba(248, 113, 113, 1)',
                      ],
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <span
                      className="bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 bg-clip-text text-transparent"
                    >
                      KAA BOOMMM!!
                    </span>
                  </motion.div>

                  {/* Secondary burst effect */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-4 h-4 rounded-full"
                      style={{
                        background: ['#fbbf24', '#f87171', '#fb923c'][i % 3],
                        boxShadow: `0 0 10px ${['#fbbf24', '#f87171', '#fb923c'][i % 3]}`,
                      }}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: [0, Math.cos(i * 30 * Math.PI / 180) * 200],
                        y: [0, Math.sin(i * 30 * Math.PI / 180) * 200],
                      }}
                      transition={{
                        duration: 0.8,
                        ease: 'easeOut',
                        delay: i * 0.02,
                      }}
                    />
                  ))}
                </div>

                {/* Flash effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0] }}
                  transition={{ duration: 0.3, times: [0, 0.5, 1] }}
                  style={{ background: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, transparent 70%)' }}
                />
              </motion.div>
            )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default GameOverAnimation;
