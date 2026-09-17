import React, { useState } from 'react';
import { Heart, Sparkles, Mail } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { romanticAudio } from '../utils/audioSynth';

interface EnvelopeLandingProps {
  partnerName: string;
  photoUrl: string;
  onOpenLetter: () => void;
  onStartOpen?: () => void;
}

export const EnvelopeLanding: React.FC<EnvelopeLandingProps> = ({
  partnerName,
  photoUrl,
  onOpenLetter,
  onStartOpen,
}) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);

    if (onStartOpen) {
      onStartOpen();
    }

    // Iniciar a música romântica automaticamente ao abrir a carta
    try {
      romanticAudio.play();
    } catch (e) {
      console.warn('Erro ao reproduzir áudio automaticamente:', e);
    }

    // Heart and petal confetti burst
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#f43f5e', '#ec4899', '#fda4af', '#ffffff', '#e11d48'],
      shapes: ['circle'],
      scalar: 1.2,
    });

    setTimeout(() => {
      confetti({
        particleCount: 45,
        angle: 60,
        spread: 55,
        origin: { x: 0.2, y: 0.55 },
        colors: ['#ff69b4', '#ff1493', '#fff'],
      });
      confetti({
        particleCount: 45,
        angle: 120,
        spread: 55,
        origin: { x: 0.8, y: 0.55 },
        colors: ['#ff69b4', '#ff1493', '#fff'],
      });
    }, 250);

    // Delay callback so animation finishes smoothly and user transitions gracefully to the main page
    setTimeout(() => {
      onOpenLetter();
    }, 1750);
  };

  return (
    <div
      id="envelope-landing-view"
      className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-rose-100 via-pink-50 to-rose-200 select-none"
    >
      {/* Ambient background glowing particles / circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-pink-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-rose-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header Tagline - gently fades as envelope opens to give spotlight to the letter */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{
          opacity: isOpening ? 0 : 1,
          y: isOpening ? -14 : 0,
          scale: isOpening ? 0.98 : 1,
        }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center -mt-4 sm:-mt-8 mb-8 sm:mb-12 z-10 px-4"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-rose-950 tracking-tight text-center leading-tight">
          Uma cartinha para você...
        </h1>
      </motion.div>

      {/* Main Interactive Envelope Container - Desce de forma ultra aveludada e sutil enquanto a foto sobe */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{
          scale: 1,
          opacity: 1,
          y: isOpening ? 30 : 0,
        }}
        transition={{
          y: isOpening
            ? { duration: 1.05, ease: [0.16, 1, 0.3, 1], delay: 0.12 }
            : { duration: 0.9, delay: 0.1, type: 'spring', damping: 20 },
          scale: { duration: 0.9, delay: 0.1, type: 'spring', damping: 20 },
          opacity: { duration: 0.7 },
        }}
        whileHover={{
          scale: isOpening ? 1 : 1.018,
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        }}
        whileTap={{
          scale: isOpening ? 1 : 0.985,
          transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
        }}
        onClick={handleOpen}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full max-w-[340px] sm:max-w-[400px] h-[200px] sm:h-[225px] cursor-pointer z-20 group"
        style={{ perspective: 1200 }}
      >
        {/* Envelope Glow Shadow */}
        <div className="absolute inset-0 bg-rose-400/25 rounded-2xl blur-xl transition-all duration-500 group-hover:blur-2xl group-hover:bg-rose-400/35" />

        {/* 1. Envelope Back Wall (z-0) - The interior backing */}
        <div className="absolute inset-0 bg-[#f5e6e0] rounded-2xl shadow-md border-2 border-rose-200/70 z-0 overflow-hidden">
          {/* Subtle darkness gradient inside envelope slot */}
          <div className="absolute inset-0 bg-gradient-to-b from-rose-950/15 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* 2. Rising Letter with Couple Photo ("A Carta com a Foto") - Sobe suavemente em ritmo calmo e aveludado */}
        <motion.div
          initial={false}
          animate={{
            y: isOpening ? -195 : 10,
            scale: isOpening ? 1.025 : 0.96,
            opacity: isOpening ? 1 : 0,
          }}
          transition={{
            y: { duration: 1.35, delay: 0.12, ease: [0.22, 1, 0.36, 1] },
            scale: { duration: 1.35, delay: 0.12, ease: [0.22, 1, 0.36, 1] },
            opacity: { duration: 0.4, delay: 0.08, ease: 'easeOut' },
          }}
          className="absolute inset-x-0 top-0 z-15 flex flex-col items-center pointer-events-none drop-shadow-2xl px-3 sm:px-4"
        >
          {/* The Rising Photo with white border on top/sides and NO white border on the bottom */}
          <div className="relative w-full max-w-[250px] sm:max-w-[280px] bg-white pt-1.5 px-1.5 pb-0 sm:pt-2 sm:px-2 sm:pb-0 rounded-t-xl rounded-b-none shadow-2xl border border-pink-100/90 border-b-0 flex flex-col items-center overflow-hidden">
            <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden rounded-t-lg rounded-b-none bg-rose-50 flex items-center justify-center">
              <img
                src={photoUrl}
                alt="Nossa foto"
                className="w-full h-full object-cover select-none"
                style={{ objectPosition: 'center 6%' }}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>

        {/* 3. Envelope Front Pocket Face (z-20) */}
        <div className="absolute inset-0 bg-[#fdfaf7] rounded-2xl shadow-xl border-2 border-rose-200/80 overflow-hidden flex flex-col justify-between p-3 sm:p-3.5 z-20 pointer-events-none">
          {/* Post Stamp and Marks in Top Right */}
          <div className="absolute top-3 right-3 sm:right-4 flex items-start gap-1.5 z-20 pointer-events-none">
            {/* Postmark circle */}
            <div className="w-8 h-8 rounded-full border border-dashed border-rose-300/80 flex flex-col items-center justify-center rotate-[-12deg] opacity-70">
              <span className="text-[6px] uppercase font-bold text-rose-400">Amor</span>
              <Heart className="w-2 h-2 text-rose-400 fill-rose-400 my-[0.5px]" />
              <span className="text-[5px] text-rose-400 font-mono">24.09</span>
            </div>

            {/* Stamp */}
            <div className="w-8 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-sm p-1 shadow-sm border border-white flex flex-col items-center justify-center rotate-[4deg]">
              <Heart className="w-3 h-3 text-white fill-white animate-bounce" style={{ animationDuration: '2s' }} />
              <span className="text-[6px] font-bold text-white tracking-wider mt-0.5">LOVE</span>
            </div>
          </div>

          {/* Address Content - Positioned close to the left edge margin */}
          <div className="relative z-20 pl-1 sm:pl-2 pr-8 mt-auto mb-0.5 pt-2 sm:pt-3">
            <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-rose-950 tracking-wide leading-tight drop-shadow-xs">
              {partnerName || 'Rayssa'}
            </h2>
            <p className="text-[11px] sm:text-xs text-rose-800 font-sans mt-0.5 font-medium whitespace-nowrap">
              Com todo meu carinho e amor sincero ✨
            </p>
          </div>

          {/* Envelope Diagonal Decorative Crease Lines */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Left triangle line */}
            <div className="absolute left-0 bottom-0 w-0 h-0 border-l-[170px] sm:border-l-[200px] border-l-rose-200/50 border-t-[100px] sm:border-t-[112px] border-t-transparent" />
            {/* Right triangle line */}
            <div className="absolute right-0 bottom-0 w-0 h-0 border-r-[170px] sm:border-r-[200px] border-r-rose-200/50 border-t-[100px] sm:border-t-[112px] border-t-transparent" />
          </div>
        </div>

        {/* 4. Top Triangular Flap ("A Abinha") - Levanta abrindo lentamente e suavemente */}
        <motion.div
          style={{
            transformOrigin: 'top center',
          }}
          animate={{
            rotateX: isOpening ? -135 : isHovered ? -12 : 0,
            zIndex: isOpening ? 5 : 30,
          }}
          transition={{
            rotateX: {
              duration: isOpening ? 1.35 : 0.3,
              ease: [0.25, 1, 0.35, 1],
            },
            zIndex: { delay: isOpening ? 0.45 : 0 },
          }}
          className="absolute top-0 inset-x-0 h-[98px] sm:h-[112px] pointer-events-none"
        >
          <svg
            viewBox="0 0 400 112"
            preserveAspectRatio="none"
            className="w-full h-full filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]"
          >
            <defs>
              <linearGradient id="flapGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#faf2ee" />
                <stop offset="50%" stopColor="#fcf6f3" />
                <stop offset="100%" stopColor="#fdf9f7" />
              </linearGradient>
            </defs>
            <path
              d="M 0 0 L 400 0 L 208 106 Q 200 112 192 106 L 0 0 Z"
              fill="url(#flapGradient)"
              stroke="#f3ccd3"
              strokeWidth="2.5"
            />
          </svg>
        </motion.div>

        {/* 5. Round Red Wax Seal no Bico da Aba */}
        <motion.div
          animate={{
            scale: isOpening ? [1, 1.15, 0] : isHovered ? 1.08 : 1,
            opacity: isOpening ? [1, 0.8, 0] : 1,
            y: isOpening ? -22 : 0,
          }}
          transition={{
            duration: isOpening ? 0.48 : 0.3,
            ease: 'easeOut',
          }}
          className="absolute top-[78px] sm:top-[90px] left-1/2 -translate-x-1/2 z-35 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-red-700 via-rose-600 to-red-500 shadow-xl border-2 border-red-300/80 flex items-center justify-center pointer-events-none cursor-pointer"
        >
          {/* Wax Seal Rim texture */}
          <div className="absolute inset-1 rounded-full border border-red-300/50" />
          {/* Red Heart inside the Wax Seal */}
          <Heart className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white fill-white drop-shadow-sm animate-pulse" />
        </motion.div>
      </motion.div>

      {/* Action Button Below - Suave fade-out com contramovimento harmonioso */}
      <motion.button
        initial={{ opacity: 0, y: 15 }}
        animate={{
          opacity: isOpening ? 0 : 1,
          y: isOpening ? 28 : 0,
          scale: isOpening ? 0.96 : 1,
        }}
        transition={{
          y: isOpening
            ? { duration: 1.05, ease: [0.16, 1, 0.3, 1], delay: 0.12 }
            : { duration: 0.6, delay: 0.3 },
          opacity: { duration: 0.35, ease: 'easeOut' },
          scale: { duration: 0.35, ease: 'easeOut' },
        }}
        whileHover={{ scale: isOpening ? 1 : 1.04, transition: { duration: 0.3 } }}
        whileTap={{ scale: isOpening ? 1 : 0.96, transition: { duration: 0.15 } }}
        onClick={handleOpen}
        disabled={isOpening}
        id="btn-open-letter"
        className="mt-8 px-6 py-3 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-medium text-sm sm:text-base shadow-lg shadow-rose-400/30 flex items-center gap-2 hover:shadow-rose-400/50 transition-all duration-300 cursor-pointer z-20"
      >
        <Mail className="w-4 h-4" />
        <span>{isOpening ? 'Abrindo cartinha...' : 'Clique para Abrir'}</span>
        <Sparkles className="w-4 h-4 text-pink-200 animate-spin" style={{ animationDuration: '3s' }} />
      </motion.button>
    </div>
  );
};
