import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Trash2,
  Maximize2,
  Sparkles,
  Edit3,
  Check,
  Images,
  Upload,
  Link as LinkIcon,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CarouselPhotoItem } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface PhotoCarouselProps {
  photos: CarouselPhotoItem[];
  onUpdatePhotos: (updated: CarouselPhotoItem[]) => void;
  onOpenViewer?: (url: string, caption?: string) => void;
}

const TOTAL_SLOTS = 6;

export const normalizeCarouselSlots = (items?: CarouselPhotoItem[]): CarouselPhotoItem[] => {
  const result: CarouselPhotoItem[] = [];
  for (let i = 0; i < TOTAL_SLOTS; i++) {
    const existing = items?.[i];
    if (existing) {
      result.push({
        id: existing.id || `car-slot-${i + 1}`,
        imageUrl: existing.imageUrl || '',
        caption: existing.caption !== undefined ? existing.caption : `Momento especial #${i + 1} ❤️`,
        date: existing.date || '',
        slotIndex: i,
      });
    } else {
      result.push({
        id: `car-slot-${i + 1}`,
        imageUrl: '',
        caption: `Momento especial #${i + 1} ❤️`,
        date: '',
        slotIndex: i,
      });
    }
  }
  return result;
};

export const PhotoCarousel: React.FC<PhotoCarouselProps> = ({
  photos,
  onUpdatePhotos,
  onOpenViewer,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionInput, setCaptionInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Always ensure 6 slots
  const slots = normalizeCarouselSlots(photos);
  const currentSlot = slots[currentIndex] || slots[0];
  const filledSlotsCount = slots.filter((s) => Boolean(s.imageUrl)).length;

  const handleNext = useCallback(() => {
    setDirection(1);
    setIsEditingCaption(false);
    setCurrentIndex((prev) => (prev + 1) % TOTAL_SLOTS);
  }, []);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setIsEditingCaption(false);
    setCurrentIndex((prev) => (prev - 1 + TOTAL_SLOTS) % TOTAL_SLOTS);
  }, []);

  const handleGoToSlide = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setIsEditingCaption(false);
    setCurrentIndex(index);
  };

  // Touch Swipe Handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      handleNext();
    } else if (diff < -minSwipeDistance) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Add or Replace photo for current slot via file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImageFile(file, 900, 1200, 0.82);
      const updated = [...slots];
      updated[currentIndex] = {
        ...updated[currentIndex],
        imageUrl: compressed,
        date: updated[currentIndex].date || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      };
      onUpdatePhotos(updated);
    } catch (err) {
      console.error('Erro ao processar imagem para o carrossel:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add or Replace photo for current slot via direct URL
  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const updated = [...slots];
    updated[currentIndex] = {
      ...updated[currentIndex],
      imageUrl: urlInput.trim(),
      date: updated[currentIndex].date || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    };
    onUpdatePhotos(updated);
    setUrlInput('');
    setIsUrlModalOpen(false);
  };

  // Clear current slot photo
  const handleClearCurrentSlot = () => {
    if (!currentSlot.imageUrl) return;
    if (window.confirm(`Deseja remover a foto do Local ${currentIndex + 1}?`)) {
      const updated = [...slots];
      updated[currentIndex] = {
        ...updated[currentIndex],
        imageUrl: '',
      };
      onUpdatePhotos(updated);
    }
  };

  // Save caption for current slot
  const handleSaveCaption = () => {
    const updated = [...slots];
    updated[currentIndex] = {
      ...updated[currentIndex],
      caption: captionInput,
    };
    onUpdatePhotos(updated);
    setIsEditingCaption(false);
  };

  // Slide motion variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 110 : -110,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.3 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -110 : 110,
      opacity: 0,
      scale: 0.96,
      transition: {
        x: { type: 'spring', stiffness: 280, damping: 28 },
        opacity: { duration: 0.22 },
      },
    }),
  };

  return (
    <div
      id="carrossel-de-fotos"
      className="w-full bg-white/95 backdrop-blur-sm rounded-3xl p-3.5 sm:p-5 border border-pink-200/90 shadow-sm flex flex-col items-center select-none"
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Header with Title & Slot Status */}
      <div className="w-full flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
            <Images className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-serif italic font-bold text-base sm:text-lg text-[#5c1322] tracking-wide leading-tight">
                Carrossel de Fotos
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                6 Locais
              </span>
            </div>
            <p className="text-[11px] text-pink-700/80">
              Local {currentIndex + 1} de {TOTAL_SLOTS} • {filledSlotsCount} de {TOTAL_SLOTS} fotos adicionadas
            </p>
          </div>
        </div>

        {/* Quick Upload / Replace for current slot */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          {currentSlot.imageUrl ? (
            <>
              <RefreshCw className="w-3 h-3 text-rose-500" />
              <span>{isUploading ? 'Trocando...' : 'Trocar Foto'}</span>
            </>
          ) : (
            <>
              <Upload className="w-3 h-3 text-rose-500" />
              <span>{isUploading ? 'Enviando...' : 'Anexar Foto'}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Carousel Stage */}
      <div
        className="w-full relative flex flex-col items-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Viewport Frame */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-rose-50/70 border border-pink-200/90 shadow-inner">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentSlot.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 w-full h-full"
            >
              {currentSlot.imageUrl ? (
                /* Filled Slot View */
                <div className="relative w-full h-full group bg-pink-50">
                  <img
                    src={currentSlot.imageUrl}
                    alt={currentSlot.caption || `Foto do Local ${currentIndex + 1}`}
                    className="w-full h-full object-cover cursor-pointer select-none transition-transform duration-500 group-hover:scale-105"
                    onClick={() => onOpenViewer && onOpenViewer(currentSlot.imageUrl, currentSlot.caption)}
                    referrerPolicy="no-referrer"
                  />

                  {/* Top Controls Overlay */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                    {onOpenViewer && (
                      <button
                        type="button"
                        onClick={() => onOpenViewer(currentSlot.imageUrl, currentSlot.caption)}
                        className="p-1.5 rounded-full bg-black/45 hover:bg-black/70 text-white backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                        title="Ver em tela cheia"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleClearCurrentSlot}
                      className="p-1.5 rounded-full bg-red-600/70 hover:bg-red-600 text-white backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                      title="Remover foto deste local"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty Slot View (Invites adding a photo) */
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-center cursor-pointer hover:bg-pink-100/40 transition-colors group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-rose-100/90 text-rose-500 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-xs">
                    {isUploading ? (
                      <RefreshCw className="w-7 h-7 animate-spin" />
                    ) : (
                      <Camera className="w-7 h-7 stroke-[1.5]" />
                    )}
                  </div>
                  <h4 className="font-serif italic font-bold text-base text-[#5c1322]">
                    Local {currentIndex + 1} de {TOTAL_SLOTS} para Foto
                  </h4>
                  <p className="text-xs text-pink-700/80 mt-0.5 max-w-[240px]">
                    Toque aqui para escolher uma foto especial para este local do carrossel ❤️
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition-transform group-hover:scale-105">
                      <Upload className="w-3.5 h-3.5" />
                      {isUploading ? 'Enviando...' : 'Escolher Foto'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsUrlModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-pink-50 text-pink-700 border border-pink-200 text-xs font-medium rounded-full shadow-2xs transition-colors"
                    >
                      Por Link
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-rose-900 shadow-md backdrop-blur-xs flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-20 cursor-pointer border border-pink-200/60"
            title="Local anterior"
            aria-label="Local anterior"
          >
            <ChevronLeft className="w-4 h-4 text-rose-800" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-rose-900 shadow-md backdrop-blur-xs flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-20 cursor-pointer border border-pink-200/60"
            title="Próximo local"
            aria-label="Próximo local"
          >
            <ChevronRight className="w-4 h-4 text-rose-800" />
          </button>

          {/* Local / Slot Pill Badge */}
          <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none">
            <span className="text-[10px] font-bold bg-black/50 text-white px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5 text-pink-300" />
              Local {currentIndex + 1} de {TOTAL_SLOTS}
            </span>
          </div>
        </div>

        {/* BOLINHAS INDICANDO AS PRÓXIMAS FOTOS (6 SLOTS DOTS INDICATOR) */}
        <div
          className="w-full flex items-center justify-center gap-2 mt-3.5 py-1 px-2"
          role="tablist"
          aria-label="Bolinhas indicadoras dos 6 locais de foto"
        >
          {slots.map((slot, idx) => {
            const isActive = idx === currentIndex;
            const isFilled = Boolean(slot.imageUrl);
            const isNext = idx === (currentIndex + 1) % TOTAL_SLOTS;

            return (
              <button
                key={slot.id || idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Local ${idx + 1} de 6${isFilled ? ' (com foto)' : ' (vazio)'}${isNext ? ' (Próxima)' : ''}`}
                onClick={() => handleGoToSlide(idx)}
                title={`Ir para o Local ${idx + 1} de 6${isFilled ? ' (com foto)' : ' (vazio)'}`}
                className={`transition-all duration-300 relative cursor-pointer focus:outline-none flex items-center justify-center ${
                  isActive
                    ? 'w-8 h-3.5 bg-gradient-to-r from-rose-500 to-red-500 rounded-full shadow-sm text-[10px] text-white font-bold'
                    : isFilled
                    ? 'w-3.5 h-3.5 rounded-full bg-rose-400 hover:bg-rose-500 hover:scale-125'
                    : 'w-3.5 h-3.5 rounded-full border-2 border-dashed border-pink-300 bg-pink-100/40 hover:border-rose-400 hover:scale-125'
                }`}
              >
                {isActive ? (
                  <span>{idx + 1}</span>
                ) : (
                  isNext && (
                    <span className="absolute inset-0 rounded-full ring-2 ring-rose-400/60 animate-pulse pointer-events-none" />
                  )
                )}
              </button>
            );
          })}
        </div>

        {/* Caption & Date under carousel */}
        <div className="w-full mt-2 px-1">
          {isEditingCaption ? (
            <div className="flex flex-col gap-1.5">
              <textarea
                rows={2}
                value={captionInput}
                onChange={(e) => setCaptionInput(e.target.value)}
                placeholder={`Adicione uma legenda para o Local ${currentIndex + 1}... ❤️`}
                className="w-full text-xs font-serif text-[#5c1322] bg-pink-50/60 border border-pink-300 rounded-xl p-2 focus:outline-none focus:ring-1 focus:ring-rose-400 resize-none"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingCaption(false)}
                  className="px-2 py-0.5 text-[11px] text-pink-700 hover:bg-pink-100/60 rounded-md transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveCaption}
                  className="px-2.5 py-0.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                setCaptionInput(currentSlot.caption || '');
                setIsEditingCaption(true);
              }}
              className="cursor-pointer group flex items-center justify-between gap-2 p-1.5 rounded-xl hover:bg-pink-50/60 transition-colors"
              title="Clique para editar a legenda deste local"
            >
              <div className="flex-1 text-center">
                <p className="text-xs font-serif italic text-[#5c1322] leading-relaxed">
                  {currentSlot.caption || (
                    <span className="text-pink-400 not-italic">
                      Toque aqui para adicionar uma legenda para esta foto do carrossel... ❤️
                    </span>
                  )}
                </p>
                {currentSlot.date && (
                  <span className="text-[10px] text-pink-700/60 mt-0.5 block font-medium">
                    {currentSlot.date}
                  </span>
                )}
              </div>
              <Edit3 className="w-3 h-3 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </div>
          )}
        </div>

        {/* Quick Slot Selection Chips (1 to 6) */}
        <div className="w-full mt-2.5 pt-2.5 border-t border-pink-100/80 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-medium text-pink-700/70 mr-1">Locais:</span>
          {slots.map((slot, idx) => (
            <button
              key={`chip-${slot.id || idx}`}
              type="button"
              onClick={() => handleGoToSlide(idx)}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'bg-rose-500 text-white shadow-2xs scale-105'
                  : slot.imageUrl
                  ? 'bg-pink-100 text-rose-800 hover:bg-pink-200/80'
                  : 'bg-white text-pink-400 border border-pink-200/70 hover:bg-pink-50'
              }`}
            >
              #{idx + 1} {slot.imageUrl ? '✓' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Modal for Adding by URL */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-pink-200 shadow-2xl flex flex-col gap-3">
            <h4 className="font-serif italic font-bold text-base text-[#5c1322]">
              Adicionar Foto no Local {currentIndex + 1} por Link
            </h4>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://exemplo.com/nossa-foto.jpg"
              className="w-full text-xs font-sans bg-pink-50/70 border border-pink-300 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-400"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="px-3 py-1.5 text-xs text-pink-700 hover:bg-pink-100/60 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlInput.trim()}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
