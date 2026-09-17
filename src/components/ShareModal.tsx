import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageCircle, Heart, Sparkles, Download } from 'lucide-react';
import { RelationshipConfig } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RelationshipConfig;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  // Generate shareable URL with parameters if modified
  const currentUrl = window.location.href.split('?')[0];
  const shareMessage = `Oi meu amor ❤️ Preparei essa página especial para comemorar o nosso amor: ${currentUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyText = () => {
    const fullLetter = `${config.letterGreeting}\n\n${config.letterParagraphs.join('\n\n')}\n\n${config.letterClosing || ''}\n${config.letterEmojis}`;
    navigator.clipboard.writeText(fullLetter);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fff5f6] border border-pink-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-[#591424]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100 bg-white/70">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-lg text-[#5c1626]">Compartilhar Amor</h3>
          </div>
          <button
            id="close-share-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 text-pink-700 hover:text-pink-900 rounded-full hover:bg-pink-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          <p className="text-xs text-[#6e1e30] leading-relaxed">
            Envie este link para <strong className="font-semibold text-pink-700">{config.partnerName}</strong> no WhatsApp ou copie o texto completo da declaração.
          </p>

          {/* WhatsApp Direct Share Button */}
          <button
            id="whatsapp-share-btn"
            type="button"
            onClick={handleWhatsAppShare}
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl font-semibold flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98 cursor-pointer text-sm"
          >
            <MessageCircle className="w-5 h-5 fill-white" />
            <span>Enviar no WhatsApp</span>
          </button>

          {/* Copy Link Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#6e1e30]">
              Link da Página
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-pink-200 text-[#4c121e] select-all"
              />
              <button
                id="copy-link-btn"
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-medium rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Copy Love Letter Text */}
          <button
            id="copy-letter-text-btn"
            type="button"
            onClick={handleCopyText}
            className="w-full py-2.5 px-4 bg-white hover:bg-pink-50 border border-pink-200 text-pink-800 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer text-xs"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span>Texto copiado com sucesso!</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                <span>Copiar texto da declaração</span>
              </>
            )}
          </button>

          {/* Download out.zip Card */}
          <div className="pt-2 border-t border-pink-200/60 space-y-2">
            <div className="p-3.5 bg-rose-50/70 border border-rose-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-rose-600" />
                  <span className="font-semibold text-xs text-rose-950">Baixar Pasta out (.ZIP)</span>
                </div>
                <span className="text-[10px] bg-rose-200/70 text-rose-900 font-medium px-2 py-0.5 rounded-full">
                  ~3.6 MB
                </span>
              </div>
              <p className="text-[11px] text-rose-900/80 leading-relaxed">
                Arquivo ZIP com a versão estática completa: fotos, textos da carta, músicas, estilos e index.html compilado.
              </p>
              <a
                id="modal-download-zip-btn"
                href="/out.zip"
                download="out.zip"
                className="w-full py-2.5 px-3 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-lg font-medium flex items-center justify-center gap-2 shadow-xs transition-all text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar out.zip agora</span>
              </a>
            </div>

            {/* Backup from Local Browser State (Personal Photos & Texts) */}
            <div className="p-3 bg-pink-50/50 border border-pink-200/70 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-pink-950">Backup dos Seus Textos e Fotos</span>
              </div>
              <p className="text-[10px] text-pink-800/80 leading-relaxed">
                Baixa um arquivo com todos os textos que você digitou e as fotos que enviou pelo seu navegador.
              </p>
              <button
                id="export-local-data-btn"
                type="button"
                onClick={() => {
                  try {
                    const data = {
                      config: localStorage.getItem('love_relationship_config_v1'),
                      albumPhotos: localStorage.getItem('love_album_photos_v1'),
                      extraPhoto: localStorage.getItem('love_album_extra_photo_v1'),
                      carouselPhotos: localStorage.getItem('love_carousel_photos_v1'),
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'meus-textos-e-fotos-backup.json';
                    a.click();
                    URL.revokeObjectURL(url);
                  } catch (err) {
                    console.error(err);
                  }
                }}
                className="w-full py-2 px-3 bg-white hover:bg-pink-100 border border-pink-300 text-pink-900 rounded-lg font-medium flex items-center justify-center gap-1.5 text-xs transition-all cursor-pointer"
              >
                <Download className="w-3 h-3 text-pink-600" />
                <span>Salvar Backup dos Meus Dados (JSON)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-pink-100 bg-white/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-pink-800 hover:bg-pink-100 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
