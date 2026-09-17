import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlbumPhotoItem, ExtraPhotoConfig } from '../types';
import { fixAccents } from '../utils/albumStorage';
import { AlbumMessageSection } from './AlbumMessageSection';
import { MusicPlayer } from './MusicPlayer';

interface PhotoAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  photos: AlbumPhotoItem[];
  onUpdatePhotos?: (photos: AlbumPhotoItem[]) => void;
  carouselPhotos?: any[];
  onUpdateCarouselPhotos?: (photos: any[]) => void;
  extraPhoto?: ExtraPhotoConfig;
  onUpdateExtraPhoto?: (extra: ExtraPhotoConfig) => void;
  onOpenViewer?: (url: string, caption?: string) => void;
}

export const PhotoAlbumModal: React.FC<PhotoAlbumModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  photos,
}) => {
  const [fullscreenPhoto, setFullscreenPhoto] = useState<AlbumPhotoItem | null>(null);

  // Filter out any unused or empty photo slot so only real, filled memories are shown
  const displayPhotos = photos.filter(
    (item) => Boolean(item && item.imageUrl && item.imageUrl.trim() !== '')
  );

  // ESC key listener to close fullscreen photo viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreenPhoto(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="photo-album-modal"
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 24 }}
          transition={{
            duration: 0.85,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="fixed inset-0 z-50 w-full h-full bg-gradient-to-b from-[#fff8fa] via-[#fff3f6] to-[#ffeef3] flex flex-col overflow-hidden select-none sm:select-auto"
        >
          {/* Top Header */}
          <header className="shrink-0 w-full bg-white/90 backdrop-blur-md border-b border-pink-200/60 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between z-20">
            {/* Left: Back Arrow + Title "Álbum de Fotos" */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 sm:p-2 rounded-full text-[#5c1322] hover:bg-pink-100/80 active:scale-95 transition-all cursor-pointer"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <h2 className="text-base sm:text-lg md:text-xl font-serif italic font-bold text-[#5c1322] tracking-wide whitespace-nowrap">
                Álbum de Fotos
              </h2>
            </div>
          </header>

          {/* Fullscreen Scrollable Content */}
          <main className="flex-1 overflow-y-auto overscroll-contain px-2 sm:px-4 lg:px-6 py-3 sm:py-5">
            <div className="max-w-5xl mx-auto w-full space-y-5">
              {/* GRID DE FOTOS DO ÁLBUM - Exibição direta, pura e sem botões de edição */}
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full">
                  {displayPhotos.map((item, index) => {
                    const defaultFallbackTitle =
                      index === 0 || item.id === '1'
                        ? 'Nosso Primeiro Encontro'
                        : index === 1 || item.id === '2'
                        ? 'Dia dos Namorados'
                        : index === 2 || item.id === '3'
                        ? 'Aniversário de 17 Anos'
                        : index === 3 || item.id === '4'
                        ? 'Desfile do Meu Amor'
                        : `Memória #${index + 1}`;

                    const currentTitle =
                      item.title !== undefined && item.title !== ''
                        ? item.title === 'Aniversário de 18 Anos'
                          ? 'Aniversário de 17 Anos'
                          : item.title
                        : defaultFallbackTitle;

                    const formattedTitle = fixAccents(currentTitle);
                    const formattedDate = fixAccents(item.date);
                    const formattedCaption = fixAccents(item.caption);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
                        className="bg-white rounded-xl sm:rounded-2xl p-1.5 sm:p-2 pb-3 sm:pb-4 shadow-md hover:shadow-lg border border-pink-100/90 flex flex-col transition-all duration-300 group"
                      >
                        {/* Photo Container 3x4 - Toque para ampliar */}
                        <div
                          onClick={() => setFullscreenPhoto(item)}
                          className="relative w-full aspect-[3/4] mx-auto bg-rose-50/60 rounded-lg sm:rounded-xl overflow-hidden border border-pink-200/70 shadow-inner flex flex-col items-center justify-center cursor-pointer group"
                        >
                          <img
                            src={item.imageUrl}
                            alt={formattedCaption || formattedTitle || 'Foto do álbum'}
                            className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.03]"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Área de Textos: Título, Data e Legenda exibidos normalmente como texto */}
                        <div className="mt-2.5 sm:mt-3 px-1 flex flex-col items-center text-center w-full">
                          {/* Título da Foto */}
                          <h3 className="font-serif italic font-bold text-lg sm:text-xl md:text-2xl text-[#5c1322] tracking-wide leading-snug">
                            {formattedTitle}
                          </h3>

                          {/* Data ou Ocasião */}
                          {formattedDate && formattedDate.trim() !== '' && (
                            <p className="font-serif italic font-medium text-xs sm:text-sm text-rose-700/80 tracking-wide mt-1">
                              {formattedDate}
                            </p>
                          )}

                          {/* Legenda */}
                          {formattedCaption && formattedCaption.trim() !== '' && (
                            <div className="w-full mt-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-rose-50/60 border border-rose-200/60 text-[#541220] font-serif italic text-xs sm:text-sm leading-relaxed text-center shadow-2xs whitespace-pre-wrap">
                              "{formattedCaption}"
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* SEÇÃO SURPRESA: "EU ESCOLHERIA VOCÊ NOVAMENTE TODAS AS VEZES POSSÍVEIS NESSA VIDA MEU AMOR!" */}
              <div className="w-full pt-4 border-t border-pink-200/60">
                <AlbumMessageSection partnerName={partnerName} />
              </div>
            </div>
          </main>

          {/* Player de Música embutido na parte inferior */}
          <MusicPlayer embedded />

          {/* Fullscreen Photo Viewer Lightbox - Fundo preto imersivo com foto, texto e botão de saída */}
          <AnimatePresence>
            {fullscreenPhoto && (
              <div
                className="fixed inset-0 z-70 flex flex-col items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-xl overflow-y-auto"
                onClick={() => setFullscreenPhoto(null)}
              >
                {/* Botão X para fazer a saída */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenPhoto(null);
                  }}
                  className="fixed top-4 right-4 sm:top-6 sm:right-6 z-80 w-12 h-12 rounded-full bg-white/20 hover:bg-white/35 active:scale-90 text-white flex items-center justify-center shadow-2xl backdrop-blur-md border border-white/30 transition-all cursor-pointer group"
                  title="Fechar (X)"
                  aria-label="Fechar"
                >
                  <X className="w-7 h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
                </button>

                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 15 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative max-w-md w-full flex flex-col items-center text-center my-auto py-4"
                >
                  {(() => {
                    const activeFsItem =
                      displayPhotos.find((p) => p.id === fullscreenPhoto.id) || fullscreenPhoto;
                    const rawFsTitle =
                      activeFsItem.title !== undefined && activeFsItem.title !== ''
                        ? activeFsItem.title === 'Aniversário de 18 Anos'
                          ? 'Aniversário de 17 Anos'
                          : activeFsItem.title
                        : activeFsItem.id === '1'
                        ? 'Nosso Primeiro Encontro'
                        : activeFsItem.id === '2'
                        ? 'Dia dos Namorados'
                        : activeFsItem.id === '3'
                        ? 'Aniversário de 17 Anos'
                        : activeFsItem.id === '4'
                        ? 'Desfile do Meu Amor'
                        : '';
                    const fsTitle = fixAccents(rawFsTitle);
                    const fsDate = fixAccents(activeFsItem.date);
                    const fsCaption = fixAccents(activeFsItem.caption);

                    return (
                      <>
                        <div className="w-full aspect-[3/4] max-h-[62vh] rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black flex items-center justify-center">
                          <img
                            src={activeFsItem.imageUrl || fullscreenPhoto.imageUrl}
                            alt={fsCaption || fsTitle || 'Foto do álbum'}
                            className="w-full h-full object-cover select-none"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Informações e Texto da Foto no Fundo Preto */}
                        <div className="flex flex-col items-center justify-center gap-1.5 text-white font-serif tracking-wide mt-4 text-center max-w-md w-full px-2">
                          {fsTitle && (
                            <h3 className="text-xl sm:text-2xl font-bold italic text-white drop-shadow-md">
                              {fsTitle}
                            </h3>
                          )}
                          {fsDate && (
                            <p className="text-sm sm:text-base text-rose-300 font-medium italic">
                              {fsDate}
                            </p>
                          )}
                          {fsCaption && fsCaption.trim() !== '' && (
                            <div className="mt-2.5 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md text-white text-sm sm:text-base font-serif italic leading-relaxed text-center border border-white/15 shadow-lg w-full whitespace-pre-wrap">
                              "{fsCaption}"
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}

                  {/* Botão de retorno ao álbum */}
                  <button
                    type="button"
                    onClick={() => setFullscreenPhoto(null)}
                    className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white text-xs sm:text-sm font-medium backdrop-blur-md transition-all border border-white/20 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Voltar ao Álbum</span>
                  </button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
