import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Heart, Sparkles, Edit3, Check, X, MessageCircleHeart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { HeartBalloonItem, TenThingsReasonItem } from '../types';

interface TenThingsLoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName?: string;
}

const DEFAULT_REASONS: TenThingsReasonItem[] = [
  { id: '1', number: 1, text: 'O seu sorriso que ilumina qualquer dia meu, por mais difícil que pareça.' },
  { id: '2', number: 2, text: 'O carinho e a dedicação com que você sempre cuida de nós dois.' },
  { id: '3', number: 3, text: 'O seu abraço quentinho, que é o lugar onde encontro minha paz.' },
  { id: '4', number: 4, text: 'A sua risada contagiante que me faz sorrir sem nem perceber.' },
  { id: '5', number: 5, text: 'A forma como você me apoia, me incentiva e acredita nos meus sonhos.' },
  { id: '6', number: 6, text: 'A nossa cumplicidade e as horas de conversa que passam voando.' },
  { id: '7', number: 7, text: 'O seu jeitinho doce, carinhoso e apaixonante de ser.' },
  { id: '8', number: 8, text: 'Os nossos momentos juntos, desde os mais simples passeios aos planos do futuro.' },
  { id: '9', number: 9, text: 'O brilho no seu olhar e a intensidade com que você me olha.' },
  { id: '10', number: 10, text: 'A certeza de que com você ao meu lado a vida é muito mais linda e completa.' },
];

const DEFAULT_BALLOONS: HeartBalloonItem[] = [
  {
    id: '1',
    title: 'Balão 1',
    color: '#f43f5e', // rose-500
    phrase: 'Você é a melhor escolha da minha vida todinha! Obrigado por existir. 💖',
  },
  {
    id: '2',
    title: 'Balão 2',
    color: '#e11d48', // rose-600
    phrase: 'Cada segundo ao seu lado vale por uma eternidade de felicidade. 🌸',
  },
  {
    id: '3',
    title: 'Balão 3',
    color: '#fb7185', // rose-400
    phrase: 'Obrigado por ser meu porto seguro, meu melhor amigo e meu grande amor! ⛵❤️',
  },
  {
    id: '4',
    title: 'Balão 4',
    color: '#ec4899', // pink-500
    phrase: 'Prometo te amar, te cuidar e te fazer sorrir em todos os dias que virão. ✨',
  },
  {
    id: '5',
    title: 'Balão 5',
    color: '#be123c', // rose-700
    phrase: 'Meu coração bate mais forte sempre que penso em você. Te amo infinitamente! 💌',
  },
];

export const TenThingsLoveModal: React.FC<TenThingsLoveModalProps> = ({
  isOpen,
  onClose,
  partnerName = 'Meu Amor',
}) => {
  // Load or initialize the 10 reasons
  const [reasons, setReasons] = useState<TenThingsReasonItem[]>(() => {
    const saved = localStorage.getItem('love_ten_things_reasons_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 10) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_REASONS;
  });

  // Load or initialize the 5 heart balloons
  const [balloons, setBalloons] = useState<HeartBalloonItem[]>(() => {
    const saved = localStorage.getItem('love_heart_balloons_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 5) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_BALLOONS;
  });

  // State for active balloon pop-up modal
  const [activeBalloon, setActiveBalloon] = useState<HeartBalloonItem | null>(null);
  const [editingBalloonPhrase, setEditingBalloonPhrase] = useState('');
  const [isEditingPhrase, setIsEditingPhrase] = useState(false);

  // State for editing a specific reason topic
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null);
  const [tempReasonText, setTempReasonText] = useState('');

  // Lock scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOpenBalloon = (balloon: HeartBalloonItem) => {
    setActiveBalloon(balloon);
    setEditingBalloonPhrase(balloon.phrase);
    setIsEditingPhrase(false);

    // Cute celebration confetti burst!
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#ff4081', '#f43f5e', '#fb7185', '#fda4af', '#ffffff'],
    });
  };

  const handleSaveBalloonPhrase = () => {
    if (!activeBalloon) return;
    const updated = balloons.map((b) =>
      b.id === activeBalloon.id ? { ...b, phrase: editingBalloonPhrase } : b
    );
    setBalloons(updated);
    localStorage.setItem('love_heart_balloons_v1', JSON.stringify(updated));
    setActiveBalloon({ ...activeBalloon, phrase: editingBalloonPhrase });
    setIsEditingPhrase(false);
  };

  const handleStartEditReason = (reason: TenThingsReasonItem) => {
    setEditingReasonId(reason.id);
    setTempReasonText(reason.text);
  };

  const handleSaveReason = (id: string) => {
    const updated = reasons.map((r) => (r.id === id ? { ...r, text: tempReasonText } : r));
    setReasons(updated);
    localStorage.setItem('love_ten_things_reasons_v1', JSON.stringify(updated));
    setEditingReasonId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="ten-things-love-modal"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-50 w-full h-full bg-gradient-to-b from-[#fff8fa] via-[#fff3f6] to-[#ffeef3] flex flex-col overflow-hidden select-none sm:select-auto shadow-2xl"
        >
          {/* Header */}
          <header className="shrink-0 w-full bg-white/90 backdrop-blur-md border-b border-pink-200/60 px-3 sm:px-6 py-2.5 flex items-center justify-between z-20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 -ml-1 text-pink-700 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors cursor-pointer flex items-center gap-1"
                title="Voltar ao álbum"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
                <span className="text-xs font-semibold hidden sm:inline">Voltar</span>
              </button>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-sm sm:text-base font-serif italic font-bold text-pink-950"
              >
                10 Coisas que Mais Gosto em Você
              </motion.span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
            >
              Fechar
            </button>
          </header>

          {/* Scrollable Main Content */}
          <main className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-6 py-5 sm:py-8">
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {/* Romantic Hero Card with Fade Title Animation */}
              <div className="text-center bg-white/85 backdrop-blur-sm rounded-3xl p-5 sm:p-7 border border-pink-200/70 shadow-xs relative overflow-hidden">
                <motion.div
                  initial={{ scale: 0, opacity: 0, rotate: -20 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.25, type: 'spring', stiffness: 220, damping: 14 }}
                  className="w-10 h-10 mx-auto rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-2 shadow-inner"
                >
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: 0.35,
                    duration: 0.85,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-2xl sm:text-3xl font-serif italic font-bold text-pink-950 drop-shadow-2xs"
                >
                  10 Coisas que Mais Gosto em Você
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
                  className="text-xs sm:text-sm text-pink-700/80 max-w-md mx-auto mt-1.5 leading-relaxed"
                >
                  Para {partnerName}: Cada detalhe seu me encanta. Toque no lápis para personalizar qualquer frase e clique nos 5 balões de coração espalhados ao redor das frases para abrir as mensagens secretas! ❤️
                </motion.p>
              </div>

              {/* The 10 Reasons / Topics with Small Heart Balloons Spread Around */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif italic font-bold text-pink-950 flex items-center gap-2">
                      <span>Os 10 Motivos</span>
                      <span className="text-xs font-normal text-pink-600 font-sans bg-pink-100/80 px-2.5 py-0.5 rounded-full">
                        10 tópicos
                      </span>
                    </h3>
                    <p className="text-xs text-pink-700/75 mt-0.5">
                      🎈 Há 5 balões de coração espalhados pelas frases — toque em cada um para ler ou escrever frases secretas!
                    </p>
                  </div>

                  {/* Mini quick-tap balloon bar */}
                  <div className="flex items-center gap-1.5 bg-white/85 backdrop-blur-xs px-3 py-1.5 rounded-full border border-pink-200/80 shadow-2xs self-start sm:self-auto">
                    <span className="text-[11px] font-semibold text-pink-800 mr-1">
                      5 Balões:
                    </span>
                    {balloons.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleOpenBalloon(b)}
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center hover:scale-125 active:scale-95 transition-transform cursor-pointer shadow-2xs"
                        style={{
                          background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${b.color} 60%, #881337 100%)`,
                        }}
                        title={`Abrir frase secreta do ${b.title}`}
                      >
                        <Heart className="w-3 h-3 fill-white text-white" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid of the 10 Reasons with 5 Mini Heart Balloons Spread Around Them */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-7 sm:gap-x-5 sm:gap-y-8 pt-3">
                  {reasons.map((item) => {
                    const isEditing = editingReasonId === item.id;

                    // Spread the 5 heart balloons playfully across cards 1, 4, 5, 8, 9
                    const balloonMapping: Record<number, HeartBalloonItem | undefined> = {
                      1: balloons[0],
                      4: balloons[1],
                      5: balloons[2],
                      8: balloons[3],
                      9: balloons[4],
                    };
                    const assignedBalloon = balloonMapping[item.number];

                    return (
                      <div
                        key={item.id}
                        className="relative bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-pink-100/90 flex items-start gap-3 transition-all hover:shadow-md"
                      >
                        {/* Small Floating Heart Balloon attached around this phrase card */}
                        {assignedBalloon && (
                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBalloon(assignedBalloon);
                            }}
                            animate={{
                              y: [0, -6, 0],
                              rotate: [-2, 2, -2],
                            }}
                            transition={{
                              duration: 3 + (item.number % 3) * 0.5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="absolute -top-4 sm:-top-5 right-3 sm:right-4 z-10 flex items-center gap-1.5 pl-1.5 pr-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs border border-pink-200/90 shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer group"
                            title={`Toque para abrir a frase secreta do ${assignedBalloon.title}!`}
                          >
                            {/* Balloon Bubble with knot */}
                            <div className="relative flex flex-col items-center">
                              <div
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs"
                                style={{
                                  background: `radial-gradient(circle at 35% 30%, #ffffff 0%, ${assignedBalloon.color} 55%, #881337 100%)`,
                                }}
                              >
                                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white text-white drop-shadow-2xs" />
                              </div>
                              <div
                                className="w-1.5 h-1.5 rotate-45 -mt-0.5 rounded-2xs"
                                style={{ backgroundColor: assignedBalloon.color }}
                              />
                            </div>

                            <div className="flex flex-col text-left">
                              <span className="text-[10px] sm:text-[11px] font-bold text-rose-600 leading-tight flex items-center gap-1">
                                <span>{assignedBalloon.title}</span>
                                <span className="text-[10px]">🎈</span>
                              </span>
                              <span className="text-[9px] font-medium text-pink-500/80 leading-tight">
                                Toque aqui
                              </span>
                            </div>
                          </motion.button>
                        )}

                        {/* Number Badge */}
                        <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                          {item.number}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={tempReasonText}
                                onChange={(e) => setTempReasonText(e.target.value)}
                                rows={3}
                                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/40 text-pink-950 font-sans leading-relaxed resize-none"
                              />
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingReasonId(null)}
                                  className="px-2.5 py-1 rounded-lg text-xs text-pink-700 hover:bg-pink-100 cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveReason(item.id)}
                                  className="px-3 py-1 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 shadow-2xs cursor-pointer flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Salvar</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs sm:text-sm text-[#4a0f1d] leading-relaxed font-sans pr-1">
                                {item.text}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleStartEditReason(item)}
                                className="p-1 rounded-md text-pink-300 hover:text-rose-600 hover:bg-pink-50 shrink-0 transition-colors cursor-pointer"
                                title="Editar este tópico"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Return Button */}
              <div className="pt-4 pb-10 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar para o Álbum de Fotos</span>
                </button>
              </div>
            </div>
          </main>

          {/* Balloon Pop-Up Modal (Interactive viewing and writing phrases) */}
          <AnimatePresence>
            {activeBalloon && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: 20 }}
                  className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-pink-200 text-center relative overflow-hidden"
                >
                  {/* Close icon */}
                  <button
                    type="button"
                    onClick={() => setActiveBalloon(null)}
                    className="absolute top-3.5 right-3.5 text-pink-400 hover:text-rose-600 p-1 rounded-full hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Balloon Icon */}
                  <div
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 shadow-md"
                    style={{ backgroundColor: activeBalloon.color }}
                  >
                    <Heart className="w-8 h-8 fill-white text-white drop-shadow" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                    Mensagem do {activeBalloon.title} 🎈
                  </span>

                  {isEditingPhrase ? (
                    <div className="mt-3 flex flex-col gap-2.5">
                      <textarea
                        value={editingBalloonPhrase}
                        onChange={(e) => setEditingBalloonPhrase(e.target.value)}
                        rows={4}
                        placeholder="Escreva sua frase romântica aqui..."
                        className="w-full text-xs sm:text-sm p-3 rounded-2xl border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-pink-50/40 text-pink-950 font-sans leading-relaxed resize-none"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBalloonPhrase(activeBalloon.phrase);
                            setIsEditingPhrase(false);
                          }}
                          className="px-4 py-2 rounded-xl text-xs text-pink-700 hover:bg-pink-100 cursor-pointer font-medium"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveBalloonPhrase}
                          className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Salvar Frase</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="my-4 p-4 rounded-2xl bg-rose-50/80 border border-pink-100">
                        <p className="text-sm sm:text-base font-serif italic text-[#541220] leading-relaxed">
                          "{activeBalloon.phrase}"
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 mt-4">
                        <button
                          type="button"
                          onClick={() => setIsEditingPhrase(true)}
                          className="w-full py-2.5 px-4 rounded-xl bg-pink-50 hover:bg-pink-100 text-rose-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Escrever / Alterar Frase</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveBalloon(null)}
                          className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                        >
                          Fechar
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
