// Custom hook for sound management

import { useState, useCallback, useEffect } from 'react';
import { getSoundManager, SoundType } from '../utils/soundManager';

export const useSound = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const soundManager = getSoundManager();
    setIsEnabled(soundManager.isEnabled());
    setVolume(soundManager.getVolume());
    setIsInitialized(true);
  }, []);

  const play = useCallback((sound: SoundType) => {
    const soundManager = getSoundManager();
    soundManager.play(sound);
  }, []);

  const toggle = useCallback(() => {
    const soundManager = getSoundManager();
    const newState = soundManager.toggle();
    setIsEnabled(newState);
    return newState;
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    const soundManager = getSoundManager();
    soundManager.setEnabled(enabled);
    setIsEnabled(enabled);
  }, []);

  const adjustVolume = useCallback((newVolume: number) => {
    const soundManager = getSoundManager();
    soundManager.setVolume(newVolume);
    setVolume(newVolume);
  }, []);

  return {
    isEnabled,
    volume,
    isInitialized,
    play,
    toggle,
    setEnabled,
    setVolume: adjustVolume,
  };
};

export default useSound;
