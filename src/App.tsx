import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Trophy, Skull, X, HelpCircle, Bomb, User, Award, BarChart3, Info, Volume2, VolumeX, Target } from 'lucide-react';
import confetti from 'canvas-confetti';
import Board from './components/Board';
import FlagModeButton from './components/FlagModeButton';
import { createEmptyBoard, revealCell, toggleFlag, chordReveal, GameState } from './utils/gameLogic';
import { useLocalStorage, useDailyChallenge } from './hooks/useLocalStorage';
import { useSound } from './hooks/useSound';
import { useAchievements } from './hooks/useAchievements';
import CreditsModal from './components/CreditsModal';
import NameInputModal from './components/NameInputModal';
import HighScoreModal from './components/HighScoreModal';
import StatsModal from './components/StatsModal';
import AchievementsModal from './components/AchievementsModal';
import AchievementToast from './components/AchievementToast';
import DailyChallengeBanner from './components/DailyChallengeBanner';
import { Difficulty } from './types';

const DIFFICULTY_CONFIG: Record<Difficulty, { rows: number; cols: number; mines: number }> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
};

function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [gameMode, setGameMode] = useState<'classic' | 'daily'>('classic');
  const [gameState, setGameState] = useState<GameState>(
    createEmptyBoard(DIFFICULTY_CONFIG.beginner.rows, DIFFICULTY_CONFIG.beginner.cols, DIFFICULTY_CONFIG.beginner.mines)
  );
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [minesRevealed, setMinesRevealed] = useState(false);
  const [flagMode, setFlagMode] = useState(false);

  // Custom hooks
  const { playerData, isLoaded, hasName, saveName, saveGameStats, saveDailyChallenge } = useLocalStorage();
  const { challenge } = useDailyChallenge();
  const { isEnabled: soundEnabled, toggle: toggleSound, play } = useSound();
  const {
    achievements,
    totalUnlocked,
    checkUnlock,
    showToast,
    hideToast,
    unlockedAchievement,
  } = useAchievements();
  const confettiTriggeredRef = useRef(false);

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning && gameState.status === 'playing') {
      interval = window.setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, gameState.status]);

  // Confetti effect on win (only once per game)
  useEffect(() => {
    if (gameState.status === 'won' && !confettiTriggeredRef.current) {
      confettiTriggeredRef.current = true;
      
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#34d399', '#f87171', '#c084fc', '#fbbf24'],
        gravity: 0.8,
        drift: 0,
        scalar: 0.8,
      });
      
      setIsTimerRunning(false);
      play('victory');

      // Save stats
      if (gameMode === 'classic') {
        saveGameStats(true, difficulty, timer);
      } else if (gameMode === 'daily' && !challenge.completed) {
        saveDailyChallenge(timer);
      }

      // Check achievements
      checkUnlock('game_won', {
        difficulty,
        time: timer,
        currentStreak: playerData.stats.currentStreak + 1,
        totalGames: playerData.stats.totalGames + 1,
        perfectGame: gameState.flagsUsed === gameState.totalMines,
      });
    } else if (gameState.status === 'lost') {
      setIsTimerRunning(false);
      play('explosion');
      setTimeout(() => play('gameOver'), 500);
      // Save loss stats
      if (gameMode === 'classic') {
        saveGameStats(false, difficulty, timer);
      }
    }
  }, [gameState.status, gameMode, difficulty, timer, saveGameStats, saveDailyChallenge, challenge.completed, play, checkUnlock, playerData.stats.currentStreak, playerData.stats.totalGames, gameState.flagsUsed, gameState.totalMines]);

  // Reset game
  const resetGame = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty];
    setGameState(createEmptyBoard(config.rows, config.cols, config.mines));
    setTimer(0);
    setIsTimerRunning(false);
    setMinesRevealed(false);
    confettiTriggeredRef.current = false; // Reset confetti trigger
  }, [difficulty]);

  // Change difficulty
  const changeDifficulty = useCallback((newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setGameMode('classic');
    const config = DIFFICULTY_CONFIG[newDifficulty];
    setGameState(createEmptyBoard(config.rows, config.cols, config.mines));
    setTimer(0);
    setIsTimerRunning(false);
    setMinesRevealed(false);
    confettiTriggeredRef.current = false; // Reset confetti trigger
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    setGameState((prev) => {
      const newState = revealCell(prev, row, col);
      if (prev.status === 'idle' && newState.status === 'playing') {
        setIsTimerRunning(true);
      }
      if (newState.status !== prev.status || newState.board[row][col].isRevealed !== prev.board[row][col].isRevealed) {
        play('click');
      }
      return newState;
    });
  }, [play]);

  // Handle right click (flag)
  const handleCellRightClick = useCallback((row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    setGameState((prev) => {
      const newState = toggleFlag(prev, row, col);
      if (newState.board[row][col].isFlagged !== prev.board[row][col].isFlagged) {
        play('flag');
      }
      return newState;
    });
  }, [play]);

  // Handle double click (chord)
  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    setGameState((prev) => {
      const newState = chordReveal(prev, row, col);
      play('chord');
      return newState;
    });
  }, [play]);

  // Reveal all bombs
  const handleRevealBombs = useCallback(() => {
    setMinesRevealed(true);
    setGameState((prev) => {
      const newBoard = prev.board.map((row) =>
        row.map((cell) => ({
          ...cell,
          isRevealed: cell.isMine ? true : cell.isRevealed,
        }))
      );
      return { ...prev, board: newBoard };
    });
  }, []);

  // Format timer
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const config = DIFFICULTY_CONFIG[difficulty];

  // Handle name save
  const handleSaveName = useCallback((name: string) => {
    saveName(name);
  }, [saveName]);

  // Start daily challenge
  const startDailyChallenge = useCallback(() => {
    setGameMode('daily');
    setDifficulty('intermediate'); // Daily challenge uses intermediate difficulty
    const config = DIFFICULTY_CONFIG.intermediate;
    setGameState(createEmptyBoard(config.rows, config.cols, config.mines));
    setTimer(0);
    setIsTimerRunning(false);
    setMinesRevealed(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      {/* Top Buttons */}
      <div className="fixed top-4 right-4 flex gap-2">
        {/* Sound Toggle Button */}
        <motion.button
          onClick={toggleSound}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35 }}
          title={soundEnabled ? "Sound On" : "Sound Off"}
        >
          {soundEnabled ? (
            <Volume2 className="w-6 h-6 text-cyan-300" />
          ) : (
            <VolumeX className="w-6 h-6 text-white/40" />
          )}
        </motion.button>

        {/* Stats Button */}
        <motion.button
          onClick={() => setShowStats(true)}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          title="Statistics"
        >
          <BarChart3 className="w-6 h-6 text-white/80" />
        </motion.button>

        {/* High Scores Button */}
        <motion.button
          onClick={() => setShowHighScores(true)}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          title="High Scores"
        >
          <Award className="w-6 h-6 text-white/80" />
        </motion.button>

        {/* Achievements Button */}
        <motion.button
          onClick={() => setShowAchievements(true)}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 transition-all duration-200 relative"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.475 }}
          title="Achievements"
        >
          <Target className="w-6 h-6 text-purple-300" />
          {totalUnlocked > 0 && (
            <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {totalUnlocked}
            </span>
          )}
        </motion.button>

        {/* Credits Button */}
        <motion.button
          onClick={() => setShowCredits(true)}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          title="Credits"
        >
          <Info className="w-6 h-6 text-white/80" />
        </motion.button>

        {/* Help Button */}
        <motion.button
          onClick={() => setShowInstructions(true)}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 rounded-lg p-3 transition-all duration-200"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          title="How to Play"
        >
          <HelpCircle className="w-6 h-6 text-white/80" />
        </motion.button>
      </div>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-black/30 p-6 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">How to Play</h2>
                <motion.button
                  onClick={() => setShowInstructions(false)}
                  className="text-white/60 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <div className="space-y-4 text-white/90">
                <div>
                  <h3 className="font-semibold text-cyan-300 mb-1">🎯 Objective</h3>
                  <p className="text-sm">Reveal all cells without hitting any mines. Numbers show how many mines are adjacent.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-cyan-300 mb-1">🖱️ Controls</h3>
                  <ul className="text-sm space-y-1">
                    <li><strong>Left Click:</strong> Reveal a cell</li>
                    <li><strong>Right Click:</strong> Flag a suspected mine</li>
                    <li><strong>Double Click:</strong> Reveal neighbors (chording)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-cyan-300 mb-1">💡 Tips</h3>
                  <ul className="text-sm space-y-1">
                    <li>• First click is always safe</li>
                    <li>• Use flags to mark mines</li>
                    <li>• Numbers indicate adjacent mine count</li>
                    <li>• Chording: Click revealed number with correct flags to reveal neighbors</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-cyan-300 mb-1">🎮 Difficulty</h3>
                  <ul className="text-sm space-y-1">
                    <li><strong>Beginner:</strong> 9×9 grid, 10 mines</li>
                    <li><strong>Intermediate:</strong> 16×16 grid, 40 mines</li>
                    <li><strong>Expert:</strong> 30×16 grid, 99 mines</li>
                  </ul>
                </div>
              </div>

              <motion.button
                onClick={() => setShowInstructions(false)}
                className="w-full mt-6 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-semibold py-3 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Got it!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Title */}
      <motion.h1
        className="font-retro text-2xl sm:text-3xl md:text-4xl text-cyan-300 mb-2 text-center drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        MinesLeeper
      </motion.h1>
      <motion.p
        className="text-white/60 text-sm mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        by Kang Lee
      </motion.p>

      {/* Player Name Display */}
      {hasName && (
        <motion.div
          className="flex items-center gap-2 mb-4 text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <User className="w-4 h-4" />
          <span className="text-sm">{playerData.name}</span>
        </motion.div>
      )}

      {/* Daily Challenge Banner */}
      {isLoaded && (
        <DailyChallengeBanner challenge={challenge} onClick={startDailyChallenge} />
      )}

      {/* Game Mode & Difficulty Selector */}
      <motion.div
        className="flex flex-col sm:flex-row gap-2 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex gap-2">
          {(['beginner', 'intermediate', 'expert'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => changeDifficulty(diff)}
              disabled={gameMode === 'daily'}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                difficulty === diff && gameMode === 'classic'
                  ? 'bg-white/20 text-white shadow-lg shadow-white/10'
                  : gameMode === 'daily'
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => changeDifficulty(difficulty)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
            gameMode === 'daily'
              ? 'bg-purple-500/30 text-purple-300 shadow-lg shadow-purple-500/10'
              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          Daily Challenge
        </button>
      </motion.div>

      {/* Landscape mode suggestion for Expert on mobile */}
      {difficulty === 'expert' && (
        <motion.div
          className="bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm px-4 py-2 rounded-lg mb-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          📱 Tip: Expert mode plays best in landscape orientation
        </motion.div>
      )}

      {/* HUD */}
      <motion.div
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 mb-6 flex items-center justify-between gap-6 w-full max-w-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* Mine Counter */}
        <div className="flex items-center gap-2">
          <Skull className="w-5 h-5 text-red-400" />
          <span className="font-mono text-2xl text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
            {config.mines - gameState.flagsUsed}
          </span>
        </div>

        {/* Reveal Bombs Button */}
        {gameState.status === 'lost' && !minesRevealed && (
          <motion.button
            onClick={handleRevealBombs}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg p-3 transition-all duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Reveal all bombs"
          >
            <Bomb className="w-6 h-6" />
          </motion.button>
        )}

        {/* Reset Button */}
        <motion.button
          onClick={resetGame}
          className="bg-white/10 hover:bg-white/20 rounded-lg p-3 transition-all duration-200 hover:animate-pulse"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {gameState.status === 'won' ? (
            <Trophy className="w-6 h-6 text-yellow-400" />
          ) : gameState.status === 'lost' ? (
            <Skull className="w-6 h-6 text-red-400" />
          ) : (
            <RotateCcw className="w-6 h-6 text-white/80" />
          )}
        </motion.button>

        {/* Timer */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-2xl text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
            {formatTime(timer)}
          </span>
        </div>
      </motion.div>

      {/* Game Status Message */}
      <AnimatePresence>
        {gameState.status === 'won' && (
          <motion.div
            className="mb-4 text-2xl font-bold text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            🎉 You Won! 🎉
          </motion.div>
        )}
        {gameState.status === 'lost' && (
          <motion.div
            className="mb-4 text-2xl font-bold text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            💥 Game Over 💥
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <div className="overflow-auto max-w-full">
        <Board
          gameState={gameState}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
          onCellDoubleClick={handleCellDoubleClick}
          flagMode={flagMode}
        />
      </div>

      {/* Mobile Flag Mode Button */}
      <FlagModeButton isActive={flagMode} onToggle={() => setFlagMode(!flagMode)} />

      {/* Instructions */}
      <motion.div
        className="mt-6 text-center text-white/50 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>Left click to reveal • Right click to flag • Double click to chord</p>
      </motion.div>

      {/* Credits Modal */}
      <CreditsModal isOpen={showCredits} onClose={() => setShowCredits(false)} />

      {/* Name Input Modal */}
      <NameInputModal
        isOpen={isLoaded && !hasName}
        onSave={handleSaveName}
      />

      {/* High Score Modal */}
      <HighScoreModal
        isOpen={showHighScores}
        onClose={() => setShowHighScores(false)}
        highScores={playerData.highScores}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={playerData.stats}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        achievements={achievements}
        totalUnlocked={totalUnlocked}
      />

      {/* Achievement Toast */}
      <AchievementToast
        achievement={unlockedAchievement}
        show={showToast}
        onHide={hideToast}
      />
    </div>
  );
}

export default App;
