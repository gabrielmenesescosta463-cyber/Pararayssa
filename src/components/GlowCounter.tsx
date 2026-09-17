import React, { useEffect, useState } from 'react';
import { calculateTimeElapsed } from '../utils/dateCalculator';
import { TimeElapsed } from '../types';
import confetti from 'canvas-confetti';

interface GlowCounterProps {
  startDate: string;
  displayDateText?: string;
  onCounterClick?: () => void;
}

export const GlowCounter: React.FC<GlowCounterProps> = ({
  startDate,
  displayDateText,
  onCounterClick,
}) => {
  const [timeElapsed, setTimeElapsed] = useState<TimeElapsed>(() =>
    calculateTimeElapsed(startDate)
  );

  useEffect(() => {
    // Initial calculation
    setTimeElapsed(calculateTimeElapsed(startDate));

    // Real-time ticking every second
    const interval = setInterval(() => {
      setTimeElapsed(calculateTimeElapsed(startDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [startDate]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Burst small hearts confetti
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#ff4081', '#f43f5e', '#fb7185', '#fda4af', '#ffffff'],
      shapes: ['circle'],
      scalar: 0.9,
    });

    if (onCounterClick) onCounterClick();
  };

  const cards = [
    { label: 'MESES', value: timeElapsed.months },
    { label: 'DIAS', value: timeElapsed.days },
    { label: 'HORAS', value: timeElapsed.hours },
    { label: 'MIN', value: timeElapsed.minutes },
    { label: 'SEG', value: timeElapsed.seconds },
  ];

  return (
    <div id="relationship-counter" className="w-full flex flex-col items-center my-5 px-1 sm:px-2 select-none">
      {/* 5 Glow Cards Container - Quadro de horas ampliado ainda mais */}
      <div className="w-full max-w-lg sm:max-w-2xl md:max-w-3xl flex items-center justify-between gap-1.5 sm:gap-3 md:gap-4 px-0.5 sm:px-1">
        {cards.map((card, idx) => (
          <button
            key={idx}
            id={`counter-box-${card.label.toLowerCase()}`}
            type="button"
            onClick={handleCardClick}
            className="flex-1 min-w-0 bg-white/95 backdrop-blur-xs py-4 sm:py-5 md:py-6 min-h-[88px] sm:min-h-[105px] md:min-h-[120px] px-1 sm:px-2.5 md:px-3 rounded-2xl sm:rounded-3xl qlovy-glow transition-all duration-200 active:scale-95 flex flex-col items-center justify-center cursor-pointer shadow-md group hover:-translate-y-1"
            title={`${card.value} ${card.label}`}
          >
            {/* Number - Ampliado ainda mais com máximo destaque */}
            <span className="text-[28px] sm:text-[40px] md:text-[48px] font-black text-[#350d17] tracking-tight leading-none mb-1 sm:mb-1.5 font-mono transition-transform group-hover:scale-105">
              {card.value}
            </span>
            {/* Unit Label */}
            <span className="text-[11px] sm:text-xs md:text-sm font-bold text-[#8b3549] tracking-wider uppercase leading-none">
              {card.label}
            </span>
          </button>
        ))}
      </div>

      {/* Milestone / Date Text below counter */}
      {displayDateText && (
        <div className="mt-4 text-center">
          <p className="text-pink-700/90 text-xs sm:text-sm md:text-base font-semibold tracking-wide">
            {displayDateText}
          </p>
        </div>
      )}
    </div>
  );
};
