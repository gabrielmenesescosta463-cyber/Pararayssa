import React, { useState, useEffect } from 'react';
import { Heart, Share2, Mail, Sparkles, Images, Download } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { GlowCounter } from './components/GlowCounter';
import { LoveLetter } from './components/LoveLetter';
import { FloatingHearts } from './components/FloatingHearts';
import { MusicPlayer } from './components/MusicPlayer';
import { EditModal } from './components/EditModal';
import { ShareModal } from './components/ShareModal';
import { PhotoViewer } from './components/PhotoViewer';
import { LoveNotesModal } from './components/LoveNotesModal';
import { EnvelopeLanding } from './components/EnvelopeLanding';
import { HeartScratchCard } from './components/HeartScratchCard';
import { PhotoAlbumModal } from './components/PhotoAlbumModal';
import { DEFAULT_CONFIG } from './data/defaultConfig';
import { RelationshipConfig, AlbumPhotoItem, CarouselPhotoItem, ExtraPhotoConfig } from './types';
import defaultPhoto from './assets/images/couple_sunset_photo_1789424872932.jpg';
import scratchHeartPhoto from './assets/images/couple_heart_photo_1788861433458.jpg';
import couplePhotoHq from './assets/images/couple_photo_hq_1787622277692.jpg';
import couplePhoto1 from './assets/images/couple_photo_1787621603910.jpg';
import {
  saveAlbumPhotosToStorage,
  loadAlbumPhotosFromStorage,
  persistAlbumUnlockedState,
  loadAlbumUnlockedState,
  saveCarouselPhotosToStorage,
  loadCarouselPhotosFromStorage,
  saveExtraPhotoToStorage,
  loadExtraPhotoFromStorage,
  saveRelationshipConfigToStorage,
  loadRelationshipConfigFromStorage,
  fixAccents,
} from './utils/albumStorage';
import { romanticAudio } from './utils/audioSynth';

// Default image fallback for each slot so photos never appear blank or lost
const getDefaultSlotImage = (id: string, index: number): string => {
  if (id === '1' || index === 0) return defaultPhoto;
  if (id === '2' || index === 1) return couplePhotoHq;
  if (id === '3' || index === 2) return couplePhoto1;
  if (id === '4' || index === 3) return scratchHeartPhoto;
  return '';
};

export default function App() {
  const [hasOpenedLetter, setHasOpenedLetter] = useState(false);
  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(false);
  const [config, setConfig] = useState<RelationshipConfig>(() => {
    const saved = localStorage.getItem('love_relationship_config_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.partnerName === 'Feliz um ano de namoro!' || !parsed.partnerName) {
          parsed.partnerName = 'Rayssa';
        }
        if (!parsed.photoHeaderTitle || parsed.photoHeaderTitle === 'Feliz Um Ano de Namoro') {
          parsed.photoHeaderTitle = 'Feliz Um Ano de Namoro!';
        }
        if (
          !parsed.declarationSubtitle ||
          parsed.declarationSubtitle.includes('Eu te amooooo') ||
          parsed.declarationSubtitle.toLowerCase().includes('eu te amo')
        ) {
          parsed.declarationSubtitle = 'Eu te amo há:';
        }
        delete parsed.photoOffsetY;
        parsed.startDate = '2025-09-24T17:00:00';
        localStorage.setItem('love_relationship_config_v2', JSON.stringify({ ...DEFAULT_CONFIG, ...parsed }));
        return { ...DEFAULT_CONFIG, ...parsed };
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_CONFIG;
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState(false);
  const [isAlbumOpen, setIsAlbumOpen] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Active display image
  const displayImage = config.photoUrl || defaultPhoto;
  // Active scratch card photo (custom attached or default couple photo)
  const scratchPhoto = config.scratchPhotoUrl || scratchHeartPhoto;

  // 3x4 Photo Album state (loaded from storage or initialized with slots)
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhotoItem[]>(() => {
    for (const key of ['love_album_photos_v1', 'love_album_photos_backup_v1', 'love_album_photos', 'love_photos_v1']) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const validPhotos = parsed
              .filter((item: AlbumPhotoItem) => Boolean(item && item.imageUrl && item.imageUrl.trim() !== ''))
              .map((item: AlbumPhotoItem, idx: number) => {
                const fallback = getDefaultSlotImage(item.id, idx);
                return {
                  ...item,
                  imageUrl: item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : fallback,
                  title:
                    item.title !== undefined && item.title !== ''
                      ? item.title
                      : idx === 0 || item.id === '1'
                      ? 'Nosso Primeiro Encontro'
                      : '',
                };
              });
            if (validPhotos.length > 0) return validPhotos;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    const initialSlots: AlbumPhotoItem[] = [
      {
        id: '1',
        imageUrl: defaultPhoto,
        title: 'Nosso Primeiro Encontro',
        caption: 'O início da nossa linda história de amor ❤️',
        date: '24 de setembro de 2025',
      },
      {
        id: '2',
        imageUrl: couplePhotoHq,
        title: 'Dia dos Namorados',
        caption: '',
        date: '',
      },
      {
        id: '3',
        imageUrl: couplePhoto1,
        title: 'Aniversário de 17 Anos',
        caption: '',
        date: '',
      },
      {
        id: '4',
        imageUrl: scratchHeartPhoto,
        title: 'Desfile do Meu Amor',
        caption: '',
        date: '',
      },
    ];
    return initialSlots;
  });

  // Album unlock state: strictly locked until the user scratches the heart
  const [isAlbumUnlocked, setIsAlbumUnlocked] = useState<boolean>(false);

  // Extra Photo State ("Espaço para mais uma foto")
  const [extraPhoto, setExtraPhoto] = useState<ExtraPhotoConfig>(() => {
    for (const key of ['love_extra_photo_v1', 'love_extra_photo_backup_v1', 'love_extra_photo']) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && parsed.imageUrl) {
            return parsed;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return {
      imageUrl: config.extraPhotoUrl || '',
      title: config.extraPhotoTitle || 'Nosso Momento Especial',
      caption: config.extraPhotoCaption || 'Mais um instante inesquecível do nosso amor ❤️',
    };
  });

  // Photo Carousel State with dots ("Espaço com carrossel de fotos")
  const [carouselPhotos, setCarouselPhotos] = useState<CarouselPhotoItem[]>(() => {
    for (const key of ['love_carousel_photos_v1', 'love_carousel_photos_backup_v1', 'love_carousel_photos']) {
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return [
      {
        id: 'car-1',
        imageUrl: defaultPhoto,
        caption: 'O início e a certeza do nosso amor ❤️',
        date: '24 de setembro',
      },
      {
        id: 'car-2',
        imageUrl: scratchHeartPhoto,
        caption: 'Cada instante com você é mágico ✨',
        date: 'Para sempre',
      },
    ];
  });

  // Unified viewer photo (for full screen viewing on click)
  const [viewerPhotoUrl, setViewerPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Hydrate album photos from persistent IndexedDB (do not unlock album until heart is scratched)
    loadAlbumPhotosFromStorage().then((stored) => {
      if (stored && Array.isArray(stored) && stored.length > 0) {
        const validStored = stored.filter(
          (item) => Boolean(item && item.imageUrl && item.imageUrl.trim() !== '')
        );
        const enriched = (validStored.length > 0 ? validStored : stored.slice(0, 4)).map((item, idx) => {
          const fallback = getDefaultSlotImage(item.id, idx);
          return {
            ...item,
            imageUrl: item.imageUrl && item.imageUrl.trim() !== '' ? item.imageUrl : fallback,
            title: fixAccents(
              item.title !== undefined && item.title !== ''
                ? item.title === 'Aniversário de 18 Anos'
                  ? 'Aniversário de 17 Anos'
                  : item.title
                : idx === 0 || item.id === '1'
                ? 'Nosso Primeiro Encontro'
                : ''
            ),
            caption: fixAccents(item.caption),
            date: fixAccents(item.date),
          };
        });
        setAlbumPhotos(enriched);
        saveAlbumPhotosToStorage(enriched);
      }
    });

    // Hydrate carousel photos from persistent IndexedDB
    loadCarouselPhotosFromStorage().then((stored) => {
      if (stored && Array.isArray(stored) && stored.length > 0) {
        setCarouselPhotos(stored);
      }
    });

    // Hydrate extra photo from persistent IndexedDB
    loadExtraPhotoFromStorage().then((stored) => {
      if (stored && stored.imageUrl) {
        setExtraPhoto(stored);
      }
    });

    // Hydrate relationship config (including custom photos) from persistent IndexedDB
    loadRelationshipConfigFromStorage().then((storedConfig) => {
      if (storedConfig && typeof storedConfig === 'object') {
        setConfig((prev) => ({
          ...prev,
          ...storedConfig,
        }));
      }
    });
  }, []);

  const handleSaveConfig = (newConfig: RelationshipConfig) => {
    setConfig(newConfig);
    saveRelationshipConfigToStorage(newConfig);
  };

  const handleDirectMainPhotoChange = (newPhotoUrl: string) => {
    const updated: RelationshipConfig = {
      ...config,
      photoUrl: newPhotoUrl,
    };
    handleSaveConfig(updated);
  };

  const handleUpdateAlbumPhotos = (updatedPhotos: AlbumPhotoItem[]) => {
    setAlbumPhotos(updatedPhotos);
    saveAlbumPhotosToStorage(updatedPhotos);
  };

  const handleUpdateCarouselPhotos = (updatedPhotos: CarouselPhotoItem[]) => {
    setCarouselPhotos(updatedPhotos);
    saveCarouselPhotosToStorage(updatedPhotos);
  };

  const handleUpdateExtraPhoto = (updatedExtra: ExtraPhotoConfig) => {
    setExtraPhoto(updatedExtra);
    saveExtraPhotoToStorage(updatedExtra);
    handleSaveConfig({
      ...config,
      extraPhotoUrl: updatedExtra.imageUrl,
      extraPhotoTitle: updatedExtra.title,
      extraPhotoCaption: updatedExtra.caption,
    });
  };

  const handleOpenPhotoViewer = (url: string, _caption?: string) => {
    setViewerPhotoUrl(url);
    setIsPhotoViewerOpen(true);
  };

  const handleScratchPhotoChange = (newPhotoUrl: string) => {
    handleSaveConfig({
      ...config,
      scratchPhotoUrl: newPhotoUrl,
    });
  };

  const handleScratchPhotoAdjust = (adjustments: { scale: number; offsetY: number; offsetX: number }) => {
    handleSaveConfig({
      ...config,
      scratchPhotoScale: adjustments.scale,
      scratchPhotoOffsetY: adjustments.offsetY,
      scratchPhotoOffsetX: adjustments.offsetX,
    });
  };

  // Unlocks and automatically opens the 3x4 album as soon as scratching is finished
  const handleScratchRevealComplete = () => {
    setIsAlbumUnlocked(true);
    persistAlbumUnlockedState(true);
    setTimeout(() => {
      setIsAlbumOpen(true);
    }, 1100);
  };

  const handleScratchReset = () => {
    setIsAlbumUnlocked(false);
    localStorage.removeItem('love_album_unlocked');
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setIsAlbumUnlocked(false);
    localStorage.removeItem('love_album_unlocked');
    localStorage.removeItem('love_relationship_config_v2');
  };

  const handleSubtitleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { x, y },
      colors: ['#ff4081', '#f43f5e', '#ffffff', '#fb7185'],
      scalar: 1.0,
    });
  };

  return (
    <div className="min-h-screen bg-[#fceeee] text-[#621424] flex flex-col items-center justify-start relative overflow-x-hidden font-sans pb-16 selection:bg-pink-200 selection:text-pink-900">
      {/* Background Floating Ambient Hearts */}
      <FloatingHearts enabled={config.floatingHeartsEnabled} />

      <AnimatePresence mode="wait">
        {!hasOpenedLetter ? (
          <motion.div
            key="envelope-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              y: -8,
              scale: 0.99,
              filter: 'blur(2px)',
              transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
            }}
            className="w-full flex-1"
          >
            <EnvelopeLanding
              partnerName={config.partnerName}
              photoUrl={displayImage}
              onStartOpen={() => {
                setIsMusicPlayerVisible(true);
              }}
              onOpenLetter={() => {
                setHasOpenedLetter(true);
                setIsMusicPlayerVisible(true);
                if (!romanticAudio.getIsPlaying()) {
                  romanticAudio.play();
                }
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="main-declaration-content"
            initial={{ opacity: 0, y: 10, filter: 'blur(2px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex flex-col items-center"
          >
            {/* Top Floating Control Bar (Discreet & Romantic) */}
            <header className="w-full max-w-md mx-auto px-4 pt-3 pb-1 flex items-center justify-between z-30 select-none">
              <button
                type="button"
                onClick={() => {
                  setHasOpenedLetter(false);
                  setIsMusicPlayerVisible(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 hover:bg-white/90 border border-pink-200/60 shadow-xs text-[11px] font-medium tracking-wide text-pink-900/80 transition-all cursor-pointer"
                title="Voltar para a cartinha / Fechar envelope"
              >
                <Mail className="w-3 h-3 text-pink-500" />
                <span>Ver envelope</span>
              </button>

              {/* Share button in exact proportion and style of "Ver envelope" pill */}
              <div className="flex items-center gap-1.5">
                <a
                  id="download-zip-header-btn"
                  href="/out.zip"
                  download="out.zip"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 hover:bg-white/90 border border-pink-200/60 shadow-xs text-[11px] font-medium tracking-wide text-pink-900/80 transition-all cursor-pointer"
                  title="Baixar pasta out (.ZIP) com fotos e textos"
                >
                  <Download className="w-3 h-3 text-pink-500" />
                  <span>Baixar ZIP</span>
                </a>

                <button
                  id="open-share-btn"
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/70 hover:bg-white/90 border border-pink-200/60 shadow-xs text-[11px] font-medium tracking-wide text-pink-900/80 transition-all cursor-pointer"
                  title="Compartilhar"
                >
                  <Share2 className="w-3 h-3 text-pink-500" />
                  <span>Compartilhar</span>
                </button>
              </div>
            </header>

            {/* Main Mobile App Canvas (Mobile-First Layout) */}
            <main
              className={`w-full ${
                isPhoneFrame ? 'max-w-[420px]' : 'max-w-xl'
              } mx-auto px-4 sm:px-6 flex flex-col items-center relative z-10 transition-all duration-300`}
            >
              {/* 1. Header: "Feliz Um Ano de Namoro" (with the exact font-serif italic style of the letter/envelope) */}
              <div className="w-full text-center mt-3 mb-4 px-2">
                <motion.h1
                  id="partner-name-heading"
                  initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  className="text-[36px] sm:text-[44px] md:text-[48px] font-serif italic font-bold text-rose-950 tracking-wide leading-tight drop-shadow-xs transition-all"
                >
                  {config.photoHeaderTitle || 'Feliz Um Ano de Namoro!'}
                </motion.h1>
              </div>

              {/* 2. Photo Section */}
              <div className="w-full px-1 flex flex-col items-center">
                <motion.div
                  id="couple-photo-container"
                  initial={{ opacity: 0.6, y: -24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
                  onClick={() => handleOpenPhotoViewer(displayImage, config.partnerName)}
                  className="relative w-full max-w-[310px] sm:max-w-[335px] bg-white p-3.5 sm:p-4 pb-14 sm:pb-16 rounded-none shadow-[0_16px_36px_-6px_rgba(0,0,0,0.18),0_6px_16px_-2px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_42px_-6px_rgba(0,0,0,0.24),0_8px_20px_-2px_rgba(0,0,0,0.12)] border border-neutral-300/80 cursor-pointer group transition-all duration-300 hover:scale-[1.015] active:scale-[0.99] flex flex-col items-center"
                  title="Clique para ampliar a foto"
                >
                  {/* Inner Photo Frame - Proporção vertical autêntica estilo Polaroid clássica com pontas e cantos 100% retos e quadrados */}
                  <div className="relative w-full aspect-[3/4] rounded-none overflow-hidden bg-neutral-100 border border-neutral-900/15 shadow-inner">
                    <img
                      src={displayImage}
                      alt={`${config.partnerName} e Eu`}
                      className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-[1.02]"
                      style={{ objectPosition: 'center 20%' }}
                      referrerPolicy="no-referrer"
                    />
                    {/* Subtle romantic corner sparkle indicator */}
                    <div className="absolute top-2.5 right-2.5 p-1.5 bg-black/30 backdrop-blur-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white">
                      <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                    </div>

                    {/* Hover overlay hint */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                      <span className="text-[11px] font-medium bg-black/60 text-white px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-pink-300" /> Ver foto
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* 3. Subtitle / Declaration: "Eu te amo há:" - Mesma cor e estilo do título "Nossos momentos...", porém menor */}
              <div className="w-full text-center mt-6 mb-2">
                <h2
                  id="declaration-subtitle"
                  onClick={handleSubtitleClick}
                  className="text-[28px] sm:text-[32px] md:text-[34px] font-serif italic font-bold text-[#5c1322] tracking-wide leading-tight drop-shadow-xs cursor-pointer select-none transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-1.5"
                  title="Clique para ver corações!"
                >
                  <span>{config.declarationSubtitle || 'Eu te amo há:'}</span>
                </h2>
              </div>

              {/* 4. Glowing Counter Cards: "Há:" [11 MESES] [0 DIAS] [21 HORAS] [32 MIN] [12 SEG] + Date */}
              <GlowCounter
                startDate={config.startDate}
                displayDateText={config.displayDateText}
              />

              {/* 5. Love Letter & Paragraphs */}
              <LoveLetter
                greeting={config.letterGreeting}
                paragraphs={config.letterParagraphs}
                closing={config.letterClosing}
                emojis={config.letterEmojis}
              />

              {/* 6. Heart Scratch Card ("Nossos momentos...") */}
              <HeartScratchCard
                photoUrl={scratchPhoto}
                partnerName={config.partnerName}
                photoScale={config.scratchPhotoScale}
                photoOffsetY={config.scratchPhotoOffsetY}
                photoOffsetX={config.scratchPhotoOffsetX}
                onRevealComplete={handleScratchRevealComplete}
              />

              {/* 7. Dedicated Album Section: ONLY available and visible when heart is scratched */}
              <AnimatePresence>
                {isAlbumUnlocked && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 24, stiffness: 240 }}
                    className="w-full max-w-sm mt-4 bg-white/85 backdrop-blur-sm rounded-3xl p-5 border border-pink-200/80 shadow-md flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                          <Images className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-serif italic font-bold text-base text-[#5c1322] leading-none">
                            Álbum de Fotos 3x4
                          </h3>
                          <p className="text-[11px] text-pink-700/80 mt-0.5">
                            Fotos e legendas do nosso amor
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAlbumOpen(true)}
                        className="px-3 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Abrir Álbum
                      </button>
                    </div>

                    {/* Quick 3x4 thumbnails preview */}
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {albumPhotos.slice(0, 3).map((item, idx) => (
                        <div
                          key={item.id}
                          onClick={() => setIsAlbumOpen(true)}
                          className="cursor-pointer group flex flex-col items-center"
                        >
                          <div className="w-full aspect-[3/4] bg-pink-50 rounded-xl overflow-hidden border border-pink-200/80 shadow-xs flex items-center justify-center relative">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.caption || `Foto 3x4 #${idx + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-[10px] text-pink-400 font-medium text-center p-1">
                                + Foto {idx + 1}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-pink-900/80 mt-1 line-clamp-1 text-center font-medium">
                            {item.caption || 'Sem legenda'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full pb-8" />
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Music Player (Aparece subindo até a posição fixa após clicar para abrir a carta) */}
      <AnimatePresence>
        {!isAlbumOpen && isMusicPlayerVisible && (
          <MusicPlayer key="global-music-player" />
        )}
      </AnimatePresence>

      {/* Modals & Dialogs */}
      <EditModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        config={config}
        onSave={handleSaveConfig}
        onReset={handleResetConfig}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        config={config}
      />

      <PhotoViewer
        isOpen={isPhotoViewerOpen}
        onClose={() => {
          setIsPhotoViewerOpen(false);
          setViewerPhotoUrl(null);
        }}
        imageUrl={viewerPhotoUrl || displayImage}
        partnerName={config.partnerName}
      />

      <LoveNotesModal
        isOpen={isNotesOpen}
        onClose={() => setIsNotesOpen(false)}
        partnerName={config.partnerName}
      />

      <PhotoAlbumModal
        isOpen={isAlbumOpen}
        onClose={() => setIsAlbumOpen(false)}
        partnerName={config.partnerName}
        photos={albumPhotos}
        onUpdatePhotos={handleUpdateAlbumPhotos}
        carouselPhotos={carouselPhotos}
        onUpdateCarouselPhotos={handleUpdateCarouselPhotos}
        extraPhoto={extraPhoto}
        onUpdateExtraPhoto={handleUpdateExtraPhoto}
        onOpenViewer={handleOpenPhotoViewer}
      />
    </div>
  );
}
