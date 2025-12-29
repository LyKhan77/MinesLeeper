import React from 'react';
import { motion } from 'framer-motion';

interface NeonLetterProps {
  letter: string;
  delay: number;
}

const NeonLetter: React.FC<NeonLetterProps> = ({ letter, delay }) => {
  // Random flicker animation duration between 2-5 seconds
  const flickerDuration = 2 + Math.random() * 3;
  
  // Random buzz effect delay (some letters will buzz occasionally)
  const shouldBuzz = Math.random() > 0.7;
  const buzzDelay = shouldBuzz ? 3 + Math.random() * 7 : 0;

  return (
    <motion.span
      className="inline-block relative"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [1, 0.8, 1, 0.3, 1, 1, 0.9, 1],
      }}
      transition={{
        duration: flickerDuration,
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1 + Math.random() * 4,
        delay: delay,
      }}
    >
      {/* Main letter with neon glow */}
      <motion.span
        className="relative z-10"
        animate={
          shouldBuzz
            ? {
                opacity: [1, 0.2, 1, 0.5, 1, 0.3, 1],
                textShadow: [
                  '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
                  '0 0 5px rgba(34,211,238,0.3), 0 0 10px rgba(34,211,238,0.2)',
                  '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
                  '0 0 8px rgba(34,211,238,0.5), 0 0 15px rgba(34,211,238,0.3)',
                  '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
                  '0 0 3px rgba(34,211,238,0.2), 0 0 6px rgba(34,211,238,0.1)',
                  '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
                ],
              }
            : {
                textShadow: [
                  '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
                  '0 0 20px rgba(34,211,238,0.9), 0 0 40px rgba(34,211,238,0.5)',
                  '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
                ],
              }
        }
        transition={
          shouldBuzz
            ? {
                duration: 0.2,
                repeat: Infinity,
                repeatDelay: buzzDelay,
              }
            : {
                duration: 2,
                repeat: Infinity,
                repeatDelay: 0.5,
              }
        }
      >
        {letter}
      </motion.span>

      {/* Subtle double-vision effect for authentic neon look */}
      <span
        className="absolute top-0 left-0 text-cyan-300/20 -translate-x-px pointer-events-none"
        style={{ textShadow: '0 0 10px rgba(34,211,238,0.3)' }}
      >
        {letter}
      </span>
    </motion.span>
  );
};

const NeonTitle: React.FC = () => {
  const title = 'MinesLeeper';
  const letters = title.split('');

  return (
    <motion.h1
      className="font-retro text-2xl sm:text-3xl md:text-4xl text-cyan-300 mb-2 text-center"
      style={{
        textShadow: '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(34,211,238,0.4)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {letters.map((letter, index) => (
        <NeonLetter
          key={`${letter}-${index}`}
          letter={letter}
          delay={index * 0.05}
        />
      ))}
    </motion.h1>
  );
};

export default NeonTitle;
