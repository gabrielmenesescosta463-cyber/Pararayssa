import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

interface FloatingHeartsProps {
  enabled: boolean;
}

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
  variant: 'white-svg' | 'white-emoji' | 'pink-svg' | 'pink-emoji';
  pinkEmoji?: string;
}

export const FloatingHearts: React.FC<FloatingHeartsProps> = ({ enabled }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!enabled) {
      setParticles([]);
      return;
    }

    // Emojis de corações rosas sem flores/rosas
    const pinkEmojis = ['🩷', '💕', '💗'];

    // Generate delicate, smaller hearts with a harmonious mix of white and soft pink
    const initialParticles: Particle[] = Array.from({ length: 34 }).map((_, i) => {
      // ~65% white hearts, ~35% romantic pink hearts
      const isPink = i % 3 === 0;
      let variant: Particle['variant'];
      if (isPink) {
        variant = i % 2 === 0 ? 'pink-svg' : 'pink-emoji';
      } else {
        variant = i % 2 === 0 ? 'white-svg' : 'white-emoji';
      }

      return {
        id: i,
        left: Math.random() * 94 + 3, // 3% to 97% width
        size: Math.random() * 7 + 8, // 8px to 15px (delicate scale)
        duration: Math.random() * 8 + 8, // 8s to 16s
        delay: Math.random() * 8, // staggered entrance
        opacity: Math.random() * 0.45 + 0.35, // 0.35 to 0.8
        variant,
        pinkEmoji: pinkEmojis[Math.floor(Math.random() * pinkEmojis.length)],
      };
    });

    setParticles(initialParticles);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => {
        const isPink = p.variant === 'pink-svg' || p.variant === 'pink-emoji';

        return (
          <span
            key={p.id}
            className={`absolute select-none transition-all flex items-center justify-center ${
              isPink
                ? '' /* Sem brilho nos corações rosas */
                : 'drop-shadow-[0_0_6px_rgba(255,255,255,0.85)]'
            }`}
            style={{
              left: `${p.left}%`,
              bottom: '-30px',
              fontSize: `${p.size}px`,
              opacity: p.opacity,
              animation: `floatDelicateHeart ${p.duration}s ease-in infinite`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.variant === 'white-svg' && (
              <Heart
                style={{ width: `${p.size}px`, height: `${p.size}px` }}
                className="fill-white text-white/95 drop-shadow-[0_0_5px_rgba(255,255,255,0.9)]"
              />
            )}
            {p.variant === 'white-emoji' && (
              <span className="text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.9)]">🤍</span>
            )}
            {p.variant === 'pink-svg' && (
              <Heart
                style={{ width: `${p.size}px`, height: `${p.size}px` }}
                className="fill-rose-400 text-rose-400"
              />
            )}
            {p.variant === 'pink-emoji' && (
              <span>{p.pinkEmoji}</span>
            )}
          </span>
        );
      })}
      <style>{`
        @keyframes floatDelicateHeart {
          0% {
            transform: translateY(0) scale(0.6) rotate(-5deg);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(-55vh) scale(0.9) rotate(8deg);
            opacity: 0.75;
          }
          85% {
            opacity: 0.55;
          }
          100% {
            transform: translateY(-115vh) scale(1) rotate(20deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

