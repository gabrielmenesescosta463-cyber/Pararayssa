import React, { useState } from 'react';
import { X, Heart, Image as ImageIcon, Calendar, Type, Check, RefreshCw, Upload, Sparkles } from 'lucide-react';
import { RelationshipConfig } from '../types';
import { formatDateToPtBr } from '../utils/dateCalculator';
import { compressImageFile } from '../utils/imageCompressor';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RelationshipConfig;
  onSave: (newConfig: RelationshipConfig) => void;
  onReset: () => void;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onReset,
}) => {
  const [partnerName, setPartnerName] = useState(config.partnerName);
  const [photoHeaderTitle, setPhotoHeaderTitle] = useState(config.photoHeaderTitle || 'Feliz Um Ano de Namoro!');
  const [startDate, setStartDate] = useState(config.startDate.substring(0, 16)); // yyyy-MM-ddThh:mm
  const [declarationSubtitle, setDeclarationSubtitle] = useState(config.declarationSubtitle);
  const [photoUrl, setPhotoUrl] = useState(config.photoUrl);
  const [scratchPhotoUrl, setScratchPhotoUrl] = useState(config.scratchPhotoUrl || '');
  const [scratchPhotoScale, setScratchPhotoScale] = useState(config.scratchPhotoScale ?? 1.12);
  const [scratchPhotoOffsetY, setScratchPhotoOffsetY] = useState(config.scratchPhotoOffsetY ?? 14);
  const [scratchPhotoOffsetX, setScratchPhotoOffsetX] = useState(config.scratchPhotoOffsetX ?? 0);
  const [greeting, setGreeting] = useState(config.letterGreeting);
  const [letterText, setLetterText] = useState(config.letterParagraphs.join('\n\n'));
  const [emojis, setEmojis] = useState(config.letterEmojis);
  const [displayDateText, setDisplayDateText] = useState(config.displayDateText);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingScratch, setIsUploadingScratch] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingPhoto(true);
      try {
        const compressed = await compressImageFile(file, 900, 1200, 0.82);
        setPhotoUrl(compressed);
      } catch (err) {
        console.error('Erro ao comprimir imagem:', err);
        alert('Não foi possível processar a imagem selecionada. Tente outra foto.');
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleScratchFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingScratch(true);
      try {
        const compressed = await compressImageFile(file, 900, 1200, 0.82);
        setScratchPhotoUrl(compressed);
      } catch (err) {
        console.error('Erro ao comprimir foto da raspadinha:', err);
        alert('Não foi possível processar a imagem da raspadinha.');
      } finally {
        setIsUploadingScratch(false);
      }
    }
  };

  const handleSave = () => {
    const paragraphs = letterText
      .split('\n\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const calculatedDisplayDate = displayDateText || formatDateToPtBr(new Date(startDate));

    const updated: RelationshipConfig = {
      ...config,
      partnerName,
      photoHeaderTitle,
      startDate: new Date(startDate).toISOString(),
      displayDateText: calculatedDisplayDate,
      declarationSubtitle,
      photoUrl,
      scratchPhotoUrl,
      scratchPhotoScale,
      scratchPhotoOffsetY,
      scratchPhotoOffsetX,
      letterGreeting: greeting,
      letterParagraphs: paragraphs.length > 0 ? paragraphs : config.letterParagraphs,
      letterEmojis: emojis,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fff5f6] border border-pink-200 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-[#591424]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100 bg-white/70">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
            <h3 className="font-bold text-lg text-[#5c1626]">Personalizar Página</h3>
          </div>
          <button
            id="close-edit-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 text-pink-700 hover:text-pink-900 rounded-full hover:bg-pink-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="overflow-y-auto p-5 space-y-4 text-sm">
          {/* Título do Cabeçalho da Foto */}
          <div>
            <label className="block text-xs font-semibold text-[#6e1e30] mb-1 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-pink-500" />
              Título no Cabeçalho da Foto
            </label>
            <input
              id="input-photo-header-title"
              type="text"
              value={photoHeaderTitle}
              onChange={(e) => setPhotoHeaderTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e]"
              placeholder="Ex: Feliz Um Ano de Namoro"
            />
          </div>

          {/* Nome da Amada (Envelope e Álbum) */}
          <div>
            <label className="block text-xs font-semibold text-[#6e1e30] mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-500" />
              Nome no Envelope e Álbum
            </label>
            <input
              id="input-partner-name"
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e]"
              placeholder="Ex: Rayssa"
            />
          </div>

          {/* Subtítulo / Frase de amor */}
          <div>
            <label className="block text-xs font-semibold text-[#6e1e30] mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-500" />
              Frase abaixo da Foto
            </label>
            <input
              id="input-declaration"
              type="text"
              value={declarationSubtitle}
              onChange={(e) => setDeclarationSubtitle(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e]"
              placeholder="Ex: Eu te amo há:"
            />
          </div>

          {/* Data de início do namoro */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#6e1e30] mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                Data de Início do Relacionamento
              </label>
              <input
                id="input-start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#6e1e30] mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                Texto da Data (Abaixo do Contador)
              </label>
              <input
                id="input-display-date"
                type="text"
                value={displayDateText}
                onChange={(e) => setDisplayDateText(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e]"
                placeholder="Ex: 24 setembro 2025"
              />
            </div>
          </div>

          {/* Foto do casal */}
          <div>
            <label className="block text-xs font-semibold text-[#6e1e30] mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
              Foto do Casal (Principal)
            </label>
            <div className="space-y-2">
              <label
                htmlFor="photo-upload-input"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-dashed border-pink-300 rounded-xl cursor-pointer hover:bg-pink-50 transition-colors text-xs font-medium text-pink-700"
              >
                {isUploadingPhoto ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-pink-500 animate-spin" />
                    <span>Otimizando e salvando foto...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-pink-500" />
                    <span>Escolher foto do seu dispositivo...</span>
                  </>
                )}
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  disabled={isUploadingPhoto}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <input
                id="input-photo-url"
                type="text"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Ou cole o link direto da imagem (URL)"
                className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e]"
              />
              {photoUrl && (
                <div className="flex items-center gap-2 p-1.5 bg-pink-50/70 rounded-lg border border-pink-200/60">
                  <img
                    src={photoUrl}
                    alt="Preview casal"
                    className="w-10 h-12 object-cover rounded shadow-2xs border border-pink-200"
                  />
                  <span className="text-[11px] text-pink-800 font-medium">Foto selecionada pronta para salvar</span>
                </div>
              )}
            </div>
          </div>

          {/* Foto do Coração Raspadinha */}
          <div>
            <label className="block text-xs font-semibold text-[#6e1e30] mb-1 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              Foto do Coração da Raspadinha (Surpresa)
            </label>
            <div className="space-y-2">
              <label
                htmlFor="scratch-photo-upload-input"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-dashed border-rose-300 rounded-xl cursor-pointer hover:bg-rose-50 transition-colors text-xs font-medium text-rose-700"
              >
                {isUploadingScratch ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-rose-500 animate-spin" />
                    <span>Otimizando e salvando foto da raspadinha...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-rose-500" />
                    <span>Escolher foto para o coração raspadinha...</span>
                  </>
                )}
                <input
                  id="scratch-photo-upload-input"
                  type="file"
                  accept="image/*"
                  disabled={isUploadingScratch}
                  onChange={handleScratchFileUpload}
                  className="hidden"
                />
              </label>
              <input
                id="input-scratch-photo-url"
                type="text"
                value={scratchPhotoUrl}
                onChange={(e) => setScratchPhotoUrl(e.target.value)}
                placeholder="Ou cole o link da foto do coração (URL)"
                className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e]"
              />
              {scratchPhotoUrl && (
                <div className="flex items-center gap-2 p-1.5 bg-rose-50/70 rounded-lg border border-rose-200/60">
                  <img
                    src={scratchPhotoUrl}
                    alt="Preview raspadinha"
                    className="w-10 h-10 object-cover rounded shadow-2xs border border-rose-200"
                  />
                  <span className="text-[11px] text-rose-800 font-medium">Foto da raspadinha pronta para salvar</span>
                </div>
              )}

              {/* Ajuste de Enquadramento no Coração */}
              <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200/70 space-y-2 text-left">
                <span className="text-[11px] font-bold text-rose-900 block">
                  Ajustes de Enquadramento no Coração:
                </span>
                
                {/* Vertical */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-rose-950 font-medium">
                    <span>Posição Vertical:</span>
                    <span className="font-mono text-rose-600">
                      {scratchPhotoOffsetY > 0 ? `+${scratchPhotoOffsetY}% (Baixo)` : scratchPhotoOffsetY < 0 ? `${scratchPhotoOffsetY}% (Cima)` : '0% (Centro)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-35"
                    max="35"
                    step="1"
                    value={scratchPhotoOffsetY}
                    onChange={(e) => setScratchPhotoOffsetY(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5"
                  />
                </div>

                {/* Horizontal */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-rose-950 font-medium">
                    <span>Posição Horizontal:</span>
                    <span className="font-mono text-rose-600">
                      {scratchPhotoOffsetX > 0 ? `+${scratchPhotoOffsetX}% (Dir.)` : scratchPhotoOffsetX < 0 ? `${scratchPhotoOffsetX}% (Esq.)` : '0% (Centro)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-35"
                    max="35"
                    step="1"
                    value={scratchPhotoOffsetX}
                    onChange={(e) => setScratchPhotoOffsetX(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5"
                  />
                </div>

                {/* Zoom */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-rose-950 font-medium">
                    <span>Zoom (Aproximar / Afastar):</span>
                    <span className="font-mono text-rose-600">
                      {scratchPhotoScale.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.2"
                    step="0.05"
                    value={scratchPhotoScale}
                    onChange={(e) => setScratchPhotoScale(Number(e.target.value))}
                    className="w-full accent-rose-500 cursor-pointer h-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Saudação da carta */}
          <div>
            <label className="block text-xs font-semibold text-[#6e1e30] mb-1">
              Saudação Inicial
            </label>
            <input
              id="input-greeting"
              type="text"
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e]"
              placeholder="Meu amor,"
            />
          </div>

          {/* Texto da cartinha */}
          <div>
            <label className="block text-xs font-semibold text-[#6e1e30] mb-1">
              Texto da Carta (Separe parágrafos com duas quebras de linha)
            </label>
            <textarea
              id="textarea-letter"
              rows={5}
              value={letterText}
              onChange={(e) => setLetterText(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e] text-xs leading-relaxed"
              placeholder="Escreva sua declaração..."
            />
          </div>

          {/* Emojis finais */}
          <div>
            <label className="block text-xs font-semibold text-[#6e1e30] mb-1">
              Emojis ao Final
            </label>
            <input
              id="input-emojis"
              type="text"
              value={emojis}
              onChange={(e) => setEmojis(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-[#4c121e]"
              placeholder="🥰🥰💖💓💗💖💓"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-pink-100 bg-white/70 flex items-center justify-between gap-2">
          <button
            id="reset-config-btn"
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="px-3 py-2 text-xs font-medium text-pink-700 hover:bg-pink-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar Original
          </button>

          <div className="flex items-center gap-2">
            <button
              id="cancel-edit-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              id="save-edit-btn"
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
