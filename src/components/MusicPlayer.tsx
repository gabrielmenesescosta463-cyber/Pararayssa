import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Music,
  Play,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { romanticAudio, RomanticTrack } from '../utils/audioSynth';

interface MusicPlayerProps {
  autoPlayPrompt?: boolean;
  embedded?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ embedded = false }) => {
  const [isPlaying, setIsPlaying] = useState(romanticAudio.getIsPlaying());
  const [currentTrack, setCurrentTrack] = useState<RomanticTrack>(romanticAudio.getCurrentTrack());
  const [volume, setVolume] = useState(romanticAudio.getVolume());
  const [isMuted, setIsMuted] = useState(volume === 0);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Sync state with audio player
  useEffect(() => {
    const unsubscribe = romanticAudio.subscribe(() => {
      setIsPlaying(romanticAudio.getIsPlaying());
      setCurrentTrack(romanticAudio.getCurrentTrack());
      const currentVol = romanticAudio.getVolume();
      setVolume(currentVol);
      setIsMuted(currentVol === 0);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Close track modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowTrackModal(false);
      }
    };
    if (showTrackModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTrackModal]);

  const toggleMusic = () => {
    const newState = romanticAudio.toggle();
    setIsPlaying(newState);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMuted) {
      romanticAudio.setVolume(0.10);
    } else {
      romanticAudio.setVolume(0);
    }
  };

  return (
    <>
      {/* Sound Settings / Track Info Modal */}
      <AnimatePresence>
        {showTrackModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm bg-[#18181b] border border-neutral-800 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 flex flex-col gap-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30">
                    <Music className="w-4 h-4 text-[#ec4899]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[#ec4899]">
                      until I found you
                    </h4>
                    <p className="text-xs text-neutral-400">
                      misswilsonsays
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTrackModal(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Volume and Playback Controls */}
              <div className="bg-[#202024] p-3 rounded-2xl border border-neutral-800 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">Volume</span>
                  <span className="text-[11px] text-pink-400 font-mono">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1 text-neutral-300 hover:text-pink-400 transition-colors cursor-pointer"
                    title={isMuted ? 'Desmutar' : 'Mutar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => romanticAudio.setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>

              {/* Direct Play/Pause Button in modal */}
              <button
                type="button"
                onClick={toggleMusic}
                className="w-full py-2.5 bg-[#ec4899] hover:bg-pink-600 active:scale-[0.98] text-white font-medium text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                {isPlaying ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="w-0.5 h-3 bg-white rounded-full" />
                      <span className="w-0.5 h-3 bg-white rounded-full" />
                    </div>
                    <span>Pausar Música</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Tocar Música</span>
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FIXED BOTTOM STRIP / FAIXA INFERIOR - Anima subindo suavemente até a posição fixa */}
      <motion.footer
        initial={embedded ? false : { y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={embedded ? false : { y: '100%', opacity: 0 }}
        transition={{
          y: { duration: 0.95, ease: [0.16, 1, 0.3, 1] },
          opacity: { duration: 0.5, ease: 'easeOut' },
        }}
        className={`${
          embedded
            ? 'shrink-0 w-full z-20'
            : 'fixed bottom-0 left-0 right-0 z-40'
        } bg-[#121214]/95 backdrop-blur-md border-t border-neutral-800/80 select-none shadow-[0_-2px_15px_rgba(0,0,0,0.4)] transition-all`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 4px)' }}
      >
        <div className="w-full max-w-md mx-auto px-3.5 pt-1.5 pb-0.5 flex items-center justify-between gap-2.5">
          {/* Left: Play/Pause Circular Button + Equalizer + Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Circular Play/Pause Button */}
            <button
              id="music-play-btn"
              type="button"
              onClick={toggleMusic}
              className="w-8 h-8 rounded-full bg-[#1e1e24] hover:bg-[#282830] active:scale-95 text-white flex items-center justify-center transition-all border border-neutral-700/60 shadow-xs cursor-pointer shrink-0"
              title={isPlaying ? 'Pausar música' : 'Tocar música'}
              aria-label={isPlaying ? 'Pausar música' : 'Tocar música'}
            >
              {isPlaying ? (
                // Crisp white Pause bars ||
                <div className="flex items-center justify-center gap-[2.5px]">
                  <span className="w-0.5 h-2.5 bg-white rounded-full" />
                  <span className="w-0.5 h-2.5 bg-white rounded-full" />
                </div>
              ) : (
                // Crisp white Play triangle ▶
                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
              )}
            </button>

            {/* Pink Equalizer Bars (Animates when playing, FREEZES completely when paused) */}
            <div
              onClick={toggleMusic}
              className="flex items-end gap-[2px] h-4 px-0.5 cursor-pointer shrink-0"
              title={isPlaying ? 'Pausar música' : 'Tocar música'}
            >
              {isPlaying ? (
                <>
                  <motion.span
                    animate={{ height: [3, 9, 4, 11, 3] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }}
                    className="w-0.5 rounded-full bg-[#ec4899]"
                    style={{ minHeight: '3px' }}
                  />
                  <motion.span
                    animate={{ height: [4, 13, 6, 14, 4] }}
                    transition={{ repeat: Infinity, duration: 0.7, delay: 0.15, ease: 'easeInOut' }}
                    className="w-0.5 rounded-full bg-[#ec4899]"
                    style={{ minHeight: '4px' }}
                  />
                  <motion.span
                    animate={{ height: [6, 16, 8, 15, 6] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.05, ease: 'easeInOut' }}
                    className="w-0.5 rounded-full bg-[#ec4899]"
                    style={{ minHeight: '5px' }}
                  />
                  <motion.span
                    animate={{ height: [4, 12, 5, 13, 4] }}
                    transition={{ repeat: Infinity, duration: 0.75, delay: 0.2, ease: 'easeInOut' }}
                    className="w-0.5 rounded-full bg-[#ec4899]"
                    style={{ minHeight: '4px' }}
                  />
                  <motion.span
                    animate={{ height: [3, 9, 5, 8, 3] }}
                    transition={{ repeat: Infinity, duration: 0.65, delay: 0.1, ease: 'easeInOut' }}
                    className="w-0.5 rounded-full bg-[#ec4899]"
                    style={{ minHeight: '3px' }}
                  />
                </>
              ) : (
                /* Static paused bars: completely frozen */
                <>
                  <span className="w-0.5 h-[3px] rounded-full bg-[#ec4899] opacity-75" />
                  <span className="w-0.5 h-[7px] rounded-full bg-[#ec4899] opacity-75" />
                  <span className="w-0.5 h-[11px] rounded-full bg-[#ec4899] opacity-75" />
                  <span className="w-0.5 h-[6px] rounded-full bg-[#ec4899] opacity-75" />
                  <span className="w-0.5 h-[3px] rounded-full bg-[#ec4899] opacity-75" />
                </>
              )}
            </div>

            {/* Song Name and Artist */}
            <div
              onClick={toggleMusic}
              className="flex flex-col text-left cursor-pointer select-none min-w-0"
            >
              <span className="text-xs sm:text-[13px] font-bold text-[#ec4899] leading-tight truncate">
                {currentTrack.title || 'until I found you'}
              </span>
              <span className="text-[10px] text-neutral-400 leading-none mt-0.5 truncate">
                {currentTrack.composer || 'misswilsonsays'} {isPlaying ? '• Tocando' : '• Pausado'}
              </span>
            </div>
          </div>

          {/* Right: Audio Volume / Sound Settings Button */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 text-neutral-400 hover:text-pink-400 active:scale-95 transition-all cursor-pointer"
              title={isMuted ? 'Desmutar' : 'Mutar'}
              aria-label={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-neutral-300" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowTrackModal(true)}
              className="p-1.5 text-pink-400 hover:text-pink-300 active:scale-95 transition-all cursor-pointer"
              title="Ajustes de áudio"
              aria-label="Ajustes de áudio"
            >
              <Music className="w-4 h-4 stroke-[2] text-[#ec4899]" />
            </button>
          </div>
        </div>

        {/* Mobile home safe area indicator bar */}
        <div className="w-20 h-0.5 bg-neutral-700/50 rounded-full mx-auto mt-0.5 mb-0.5" />
      </motion.footer>
    </>
  );
};
