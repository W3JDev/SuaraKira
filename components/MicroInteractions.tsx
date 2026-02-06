import React, { useEffect, useState } from 'react';

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const Confetti: React.FC<ConfettiProps> = ({ trigger, onComplete }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        color: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
        size: Math.random() * 8 + 4,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2,
          rotation: (Math.random() - 0.5) * 10,
        },
      }));
      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 3000);
    }
  }, [trigger, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            transform: `rotate(${particle.rotation}deg)`,
            animation: `confetti-fall 3s ease-out forwards`,
            animationDelay: `${Math.random() * 0.3}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(${window.innerHeight + 100}px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// SHAKE ANIMATION COMPONENT
// ============================================================================

interface ShakeProps {
  trigger: boolean;
  children: React.ReactNode;
  onComplete?: () => void;
}

export const Shake: React.FC<ShakeProps> = ({ trigger, children, onComplete }) => {
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        onComplete?.();
      }, 500);
    }
  }, [trigger, onComplete]);

  return (
    <div className={isShaking ? 'animate-shake' : ''}>
      {children}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// SUCCESS CHECKMARK ANIMATION
// ============================================================================

interface SuccessCheckmarkProps {
  show: boolean;
  onComplete?: () => void;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      setTimeout(() => {
        onComplete?.();
      }, 1500);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-full p-6 shadow-2xl animate-scale-bounce">
        <svg
          className="w-20 h-20 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M5 13l4 4L19 7"
            className="animate-draw-check"
          />
        </svg>
      </div>
      <style jsx>{`
        @keyframes scale-bounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 0;
          }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-scale-bounce {
          animation: scale-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-draw-check {
          stroke-dasharray: 100;
          animation: draw-check 0.6s ease-out 0.2s forwards;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// ERROR SHAKE WITH ICON
// ============================================================================

interface ErrorShakeProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export const ErrorShake: React.FC<ErrorShakeProps> = ({ show, message, onComplete }) => {
  useEffect(() => {
    if (show) {
      setTimeout(() => {
        onComplete?.();
      }, 2000);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl animate-shake-error max-w-sm mx-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          {message && (
            <p className="text-slate-700 dark:text-slate-300 text-center font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes shake-error {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        .animate-shake-error {
          animation: shake-error 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// RIPPLE EFFECT (for buttons)
// ============================================================================

interface RippleEffectProps {
  x: number;
  y: number;
  color?: string;
}

export const useRipple = () => {
  const [ripples, setRipples] = useState<RippleEffectProps[]>([]);

  const addRipple = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { x, y, color: 'rgba(255, 255, 255, 0.6)' };
    setRipples([...ripples, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 600);
  };

  const RippleContainer = () => (
    <>
      {ripples.map((ripple, index) => (
        <span
          key={index}
          className="absolute rounded-full animate-ripple pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            backgroundColor: ripple.color,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
      `}</style>
    </>
  );

  return { addRipple, RippleContainer };
};

// ============================================================================
// PARTICLE BURST (for celebrations)
// ============================================================================

interface ParticleBurstProps {
  x: number;
  y: number;
  trigger: boolean;
  color?: string;
  onComplete?: () => void;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({
  x,
  y,
  trigger,
  color = '#10b981',
  onComplete,
}) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 20 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 20;
        return {
          id: i,
          x,
          y,
          angle,
          velocity: Math.random() * 3 + 2,
          size: Math.random() * 6 + 3,
        };
      });
      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1000);
    }
  }, [trigger, x, y, onComplete]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: color,
            animation: `particle-burst 1s ease-out forwards`,
            '--angle': `${particle.angle}rad`,
            '--velocity': particle.velocity,
          } as any}
        />
      ))}
      <style jsx>{`
        @keyframes particle-burst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(cos(var(--angle)) * var(--velocity) * 100px),
              calc(sin(var(--angle)) * var(--velocity) * 100px)
            ) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// PULSE RING (for highlighting elements)
// ============================================================================

interface PulseRingProps {
  show: boolean;
  color?: string;
}

export const PulseRing: React.FC<PulseRingProps> = ({ show, color = '#10b981' }) => {
  if (!show) return null;

  return (
    <>
      <div className="absolute inset-0 rounded-full animate-pulse-ring" />
      <div className="absolute inset-0 rounded-full animate-pulse-ring animation-delay-300" />
      <div className="absolute inset-0 rounded-full animate-pulse-ring animation-delay-600" />
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.8);
            opacity: 1;
            box-shadow: 0 0 0 0 ${color};
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
            box-shadow: 0 0 0 20px ${color};
          }
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
      `}</style>
    </>
  );
};

// ============================================================================
// FLOATING HEARTS (for likes/favorites)
// ============================================================================

interface FloatingHeartsProps {
  trigger: boolean;
  x: number;
  y: number;
  onComplete?: () => void;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({
  trigger,
  x,
  y,
  onComplete,
}) => {
  const [hearts, setHearts] = useState<any[]>([]);

  useEffect(() => {
    if (trigger) {
      const newHearts = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        x: x + (Math.random() - 0.5) * 40,
        y,
        delay: i * 0.2,
      }));
      setHearts(newHearts);

      setTimeout(() => {
        setHearts([]);
        onComplete?.();
      }, 2000);
    }
  }, [trigger, x, y, onComplete]);

  if (hearts.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-2xl"
          style={{
            left: `${heart.x}px`,
            top: `${heart.y}px`,
            animation: `float-heart 2s ease-out forwards`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          ❤️
        </div>
      ))}
      <style jsx>{`
        @keyframes float-heart {
          0% {
            transform: translateY(0) scale(0);
            opacity: 0;
          }
          20% {
            transform: translateY(-20px) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-150px) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// LOADING DOTS (smooth pulsing)
// ============================================================================

export const LoadingDots: React.FC<{ color?: string }> = ({ color = '#10b981' }) => {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full animate-pulse-dot"
        style={{ backgroundColor: color, animationDelay: '0s' }}
      />
      <div
        className="w-2 h-2 rounded-full animate-pulse-dot"
        style={{ backgroundColor: color, animationDelay: '0.2s' }}
      />
      <div
        className="w-2 h-2 rounded-full animate-pulse-dot"
        style={{ backgroundColor: color, animationDelay: '0.4s' }}
      />
      <style jsx>{`
        @keyframes pulse-dot {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// SHIMMER EFFECT (for loading skeletons)
// ============================================================================

export const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer-slide bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <style jsx>{`
        @keyframes shimmer-slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer-slide {
          animation: shimmer-slide 2s infinite;
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const MicroInteractions = {
  Confetti,
  Shake,
  SuccessCheckmark,
  ErrorShake,
  useRipple,
  ParticleBurst,
  PulseRing,
  FloatingHearts,
  LoadingDots,
  Shimmer,
};

export default MicroInteractions;
