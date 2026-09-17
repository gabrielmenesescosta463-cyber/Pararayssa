import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, Maximize2, Sparkles, Edit3, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { ExtraPhotoConfig } from '../types';
import { compressImageFile } from '../utils/imageCompressor';

interface ExtraPhotoCardProps {
  photoConfig: ExtraPhotoConfig;
  onUpdate: (newConfig: ExtraPhotoConfig) => void;
  onOpenViewer?: (url: string, caption?: string) => void;
}

export const ExtraPhotoCard: React.FC<ExtraPhotoCardProps> = ({
  photoConfig,
  onUpdate,
  onOpenViewer,
}) => {
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [captionInput, setCaptionInput] = useState(photoConfig.caption || '');
  const [titleInput, setTitleInput] = useState(photoConfig.title || 'Nosso Momento Especial');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImageFile(file, 900, 1200, 0.82);
      onUpdate({
        ...photoConfig,
        imageUrl: compressed,
      });
    } catch (err) {
      console.error('Erro ao comprimir imagem:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCaption = () => {
    setIsEditingCaption(false);
    onUpdate({
      ...photoConfig,
      caption: captionInput,
    });
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    onUpdate({
      ...photoConfig,
      title: titleInput || 'Nosso Momento Especial',
    });
  };

  const handleRemovePhoto = () => {
    if (window.confirm('Deseja remover esta foto?')) {
      onUpdate({
        ...photoConfig,
        imageUrl: '',
      });
    }
  };

  return (
    <motion.section
      id="extra-photo-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto my-6 px-1 select-none"
    >
      <div className="bg-white/85 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-pink-200/80 shadow-md flex flex-col items-center relative transition-all">
        {/* Header Title */}
        <div className="w-full flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <Camera className="w-3.5 h-3.5" />
            </div>
            {isEditingTitle ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                  className="w-full text-sm font-serif italic font-bold text-[#5c1322] bg-pink-50/70 border border-pink-300 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-rose-400"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveTitle}
                  className="p-1 rounded-md bg-rose-500 text-white hover:bg-rose-600 transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-1.5 cursor-pointer group"
                title="Clique para editar o título"
              >
                <h3 className="font-serif italic font-bold text-base sm:text-lg text-[#5c1322] tracking-wide leading-tight">
                  {photoConfig.title || 'Nosso Momento Especial'}
                </h3>
                <Edit3 className="w-3 h-3 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          {/* Quick upload / change button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 text-[11px] font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Upload className="w-3 h-3 text-rose-500" />
            <span>{photoConfig.imageUrl ? 'Trocar' : 'Adicionar'}</span>
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Photo Container */}
        {photoConfig.imageUrl ? (
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-pink-200 shadow-xs group bg-pink-50">
            <img
              src={photoConfig.imageUrl}
              alt={photoConfig.caption || 'Foto Especial'}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />

            {/* Floating Top Controls Overlay */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
              {onOpenViewer && (
                <button
                  type="button"
                  onClick={() => onOpenViewer(photoConfig.imageUrl, photoConfig.caption)}
                  className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                  title="Ver foto em tela cheia"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-1.5 rounded-full bg-red-600/70 hover:bg-red-600 text-white backdrop-blur-xs transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                title="Remover foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="absolute bottom-2 left-2 pointer-events-none">
              <span className="text-[10px] font-medium bg-black/40 text-white/90 px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-pink-300" /> Foto Especial
              </span>
            </div>
          </div>
        ) : (
          /* Empty placeholder frame inviting photo addition */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-pink-300/80 hover:border-rose-400 bg-pink-50/40 hover:bg-pink-50/70 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
              <Camera className="w-6 h-6" />
            </div>
            <p className="font-serif italic font-bold text-base text-[#5c1322]">
              Espaço para Mais uma Foto
            </p>
            <p className="text-xs text-pink-700/80 mt-1 max-w-[220px]">
              Toque aqui para escolher uma foto especial nossa que você ama ❤️
            </p>
            <span className="mt-3 px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full shadow-xs flex items-center gap-1.5 transition-transform group-hover:scale-105">
              <Upload className="w-3 h-3" />
              {isUploading ? 'Carregando...' : 'Escolher Foto'}
            </span>
          </div>
        )}

        {/* Caption Section */}
        {photoConfig.imageUrl && (
          <div className="w-full mt-3 px-1">
            {isEditingCaption ? (
              <div className="flex flex-col gap-1.5">
                <textarea
                  rows={2}
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  placeholder="Escreva uma legenda ou frase especial para esta foto... ❤️"
                  className="w-full text-xs font-serif text-[#5c1322] bg-pink-50/60 border border-pink-300 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-rose-400 resize-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingCaption(false)}
                    className="px-2.5 py-1 text-[11px] text-pink-700 hover:bg-pink-100/60 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCaption}
                    className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Salvar legenda
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setCaptionInput(photoConfig.caption || '');
                  setIsEditingCaption(true);
                }}
                className="cursor-pointer group flex items-start justify-between gap-2 p-2 rounded-xl hover:bg-pink-50/60 transition-colors"
                title="Clique para editar a legenda"
              >
                <p className="text-xs font-serif italic text-[#5c1322] text-center flex-1 leading-relaxed">
                  {photoConfig.caption || (
                    <span className="text-pink-400 not-italic">
                      Clique aqui para adicionar uma linda legenda a esta foto... ❤️
                    </span>
                  )}
                </p>
                <Edit3 className="w-3 h-3 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
};
