import React, { useEffect, useRef } from 'react';
import { getParticleSystem } from '../utils/particleSystem';

interface ParticleEffectProps {
  className?: string;
  onInit?: (system: ReturnType<typeof getParticleSystem>) => void;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ className = '', onInit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<ReturnType<typeof getParticleSystem> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const system = getParticleSystem();
    system.initialize(canvasRef.current);
    system.start();
    systemRef.current = system;

    if (onInit) {
      onInit(system);
    }

    return () => {
      system.stop();
    };
  }, [onInit]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 z-0 ${className}`}
      style={{ background: 'transparent' }}
    />
  );
};

export default ParticleEffect;
