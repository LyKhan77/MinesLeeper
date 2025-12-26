// Particle System for visual effects
// Canvas-based particle rendering for performance

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'sparkle' | 'explosion' | 'ambient' | 'victory';
}

class ParticleSystem {
  private particles: Particle[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationId: number | null = null;
  private isRunning: boolean = false;

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  clear(): void {
    this.particles = [];
  }

  // Create sparkle effect at position
  createSparkles(x: number, y: number, count: number = 5): void {
    const colors = ['#22d3ee', '#34d399', '#f87171', '#c084fc', '#fbbf24', '#ffffff'];
    
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 2;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 2,
        type: 'sparkle',
      });
    }
  }

  // Create explosion effect
  createExplosion(x: number, y: number): void {
    const colors = ['#ef4444', '#f87171', '#fbbf24', '#ffffff'];
    const count = 30;
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 40 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 4,
        type: 'explosion',
      });
    }
  }

  // Create ambient floating particles
  createAmbient(width: number, height: number, count: number = 20): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5 - 0.2,
        life: 0,
        maxLife: Infinity,
        color: `rgba(255, 255, 255, ${0.1 + Math.random() * 0.2})`,
        size: 1 + Math.random() * 2,
        type: 'ambient',
      });
    }
  }

  // Create victory celebration particles
  createVictory(width: number, height: number): void {
    const colors = ['#22d3ee', '#34d399', '#f87171', '#c084fc', '#fbbf24'];
    const count = 100;
    
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = height + 10;
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      const speed = 8 + Math.random() * 8;
      
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 100 + Math.random() * 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 4,
        type: 'victory',
      });
    }
  }

  private animate = (): void => {
    if (!this.isRunning || !this.ctx || !this.canvas) return;

    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    this.particles = this.particles.filter((particle) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Apply gravity for some types
      if (particle.type === 'explosion' || particle.type === 'victory') {
        particle.vy += 0.1;
      }

      // Fade out
      const alpha = particle.type === 'ambient' 
        ? parseFloat(particle.color.match(/[\d.]+\)$/)?.[0] || '0.2')
        : 1 - particle.life / particle.maxLife;

      // Draw particle
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Remove dead particles
      if (particle.type !== 'ambient' && particle.life >= particle.maxLife) {
        return false;
      }

      // Remove off-screen particles
      if (particle.x < -50 || particle.x > width + 50 || particle.y < -50 || particle.y > height + 50) {
        return false;
      }

      return true;
    });

    this.animationId = requestAnimationFrame(this.animate);
  }
}

// Singleton instance
let particleSystemInstance: ParticleSystem | null = null;

export const getParticleSystem = (): ParticleSystem => {
  if (!particleSystemInstance) {
    particleSystemInstance = new ParticleSystem();
  }
  return particleSystemInstance;
};

export default ParticleSystem;
