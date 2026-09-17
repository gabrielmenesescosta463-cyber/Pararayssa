import React, { useState } from 'react';
import { Heart, Sparkles, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface AlbumMessageSectionProps {
  partnerName?: string;
}

export const AlbumMessageSection: React.FC<AlbumMessageSectionProps> = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenSurprise = () => {
    setIsOpen(true);
    try {
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.8 },
        colors: ['#f43f5e', '#ec4899', '#fda4af', '#ffffff', '#e11d48'],
      });
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden select-none">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="surprise-button-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
            className="flex flex-col items-center gap-2.5 py-4"
          >
            <motion.button
              id="btn-album-surprise"
              type="button"
              onClick={handleOpenSurprise}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3.5 rounded-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-serif italic font-bold text-sm sm:text-base shadow-lg shadow-rose-400/30 flex items-center gap-2.5 hover:shadow-rose-400/50 transition-all cursor-pointer border border-white/40 group"
            >
              <Gift className="w-4 h-4 text-pink-100 group-hover:rotate-12 transition-transform" />
              <span>Toque para ver a surpresa especial</span>
              <Sparkles className="w-4 h-4 text-pink-200 animate-pulse" />
            </motion.button>
            <p className="text-[11px] text-pink-800/70 italic">
              Uma mensagem especial guardada para você no final do álbum ✨
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="surprise-message-wrapper"
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center justify-center"
          >
            {/* Glow suave e romântico no fundo */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-72 h-72 rounded-full bg-rose-200/50 blur-3xl"
              />
            </div>

            {/* Corações e brilhos animados flutuando */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [-6, 6, -6] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className="text-rose-400"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-300" />
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-rose-500"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
              </motion.div>

              <motion.div
                animate={{ y: [0, -7, 0], rotate: [6, -6, 6] }}
                transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                className="text-rose-400"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-300" />
              </motion.div>
            </div>

            {/* Título Principal Revelado com Fade Suave e Mais Lento */}
            <motion.div
              initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                duration: 2.4,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2,
              }}
              className="relative px-2 max-w-xl mx-auto"
            >
              <motion.h3
                animate={{
                  scale: [1, 1.012, 1],
                  textShadow: [
                    '0 2px 14px rgba(244,63,94,0.14)',
                    '0 4px 22px rgba(244,63,94,0.28)',
                    '0 2px 14px rgba(244,63,94,0.14)',
                  ],
                }}
                transition={{
                  duration: 6.0,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-[26px] sm:text-[36px] md:text-[42px] font-serif italic font-bold text-[#5c1322] tracking-wide leading-tight drop-shadow-xs"
              >
                Eu escolheria você novamente todas as vezes possíveis nessa vida meu amor!
              </motion.h3>
            </motion.div>

            {/* Coração central pulsando suavemente com entrada em fade */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, delay: 0.9, ease: 'easeOut' }}
              className="mt-4 text-rose-500 flex items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-rose-500 stroke-rose-600 drop-shadow-xs" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
