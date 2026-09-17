import React from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface LoveLetterProps {
  greeting: string;
  paragraphs: string[];
  closing?: string;
  emojis: string;
}

export const LoveLetter: React.FC<LoveLetterProps> = ({
  greeting,
  paragraphs,
  closing,
  emojis,
}) => {
  const handleEmojiClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 35,
      spread: 70,
      origin: { x, y },
      colors: ['#ff4081', '#f43f5e', '#fb7185', '#fda4af', '#f472b6'],
      scalar: 1.1,
    });
  };

  return (
    <motion.article
      id="love-letter-section"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="w-full text-left px-5 sm:px-6 my-4 sm:my-5 leading-relaxed text-[#5c1627] space-y-3 sm:space-y-3.5"
    >
      {/* Greeting */}
      {greeting && (
        <motion.p
          initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
          className="text-base sm:text-lg font-medium text-[#5c1627] tracking-normal"
        >
          {greeting}
        </motion.p>
      )}

      {/* Paragraphs */}
      {paragraphs.map((para, index) => (
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 + index * 0.1 }}
          className="text-[15px] sm:text-base font-normal text-[#5c1627] leading-[1.65] text-justify hyphens-auto"
        >
          {para}
        </motion.p>
      ))}

      {/* Closing text */}
      {closing && (
        <motion.p
          initial={{ opacity: 0, y: 12, filter: 'blur(5px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="text-[15px] sm:text-base font-medium text-[#5c1627] mt-2"
        >
          {closing}
        </motion.p>
      )}

      {/* Emojis at the end */}
      {emojis && (
        <div
          id="love-emojis-cluster"
          onClick={handleEmojiClick}
          className="pt-2 text-center text-xl sm:text-2xl tracking-wider select-none cursor-pointer transform transition-transform active:scale-110 hover:scale-105"
          title="Clique para soltar corações!"
        >
          <span>{emojis}</span>
        </div>
      )}
    </motion.article>
  );
};
