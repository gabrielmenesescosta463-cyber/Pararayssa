import React from 'react';
import { X, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PhotoViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  partnerName: string;
  onOpenEdit?: () => void;
  onChangePhoto?: (newUrl: string) => void;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  isOpen,
  onClose,
  imageUrl,
  partnerName,
}) => {
  if (!isOpen) return null;

  const handleHeartBurst = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 40,
      spread: 80,
      origin: { x, y },
      colors: ['#ff4081', '#f43f5e', '#fb7185', '#ffffff'],
      scalar: 1.2,
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-sm w-full bg-white/10 p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center cursor-default"
      >
        {/* Close Button */}
        <button
          id="close-photo-lightbox-btn"
          type="button"
          onClick={onClose}
          className="absolute -top-3 -right-3 w-9 h-9 bg-white text-pink-700 rounded-full shadow-lg flex items-center justify-center hover:bg-pink-50 transition-transform active:scale-95 cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Photo with frame */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border-2 border-white/40 group">
          <img
            src={imageUrl}
            alt={partnerName}
            className="w-full h-auto object-contain max-h-[75vh] rounded-2xl sm:rounded-3xl"
            referrerPolicy="no-referrer"
          />

          {/* Floating heart burst button over photo */}
          <button
            type="button"
            onClick={handleHeartBurst}
            className="absolute bottom-3 right-3 p-2.5 bg-white/90 hover:bg-white text-pink-600 rounded-full shadow-md transition-transform active:scale-90 flex items-center justify-center cursor-pointer backdrop-blur-xs"
            title="Enviar amor!"
          >
            <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
          </button>
        </div>

        {/* Bottom banner */}
        <div className="w-full flex items-center justify-center mt-3 px-2 text-white">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-pink-300" />
            <span>{partnerName} & Eu ❤️</span>
          </div>
        </div>
      </div>
    </div>
  );
};
