import React, { useState } from 'react';
import { X, Mail, Heart, Sparkles, Plus, Trash2 } from 'lucide-react';

interface LoveNote {
  id: string;
  title: string;
  content: string;
  date?: string;
}

interface LoveNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
}

const DEFAULT_NOTES: LoveNote[] = [
  {
    id: '1',
    title: 'O Primeiro Encontro ✨',
    content: 'O dia em que meus olhos te encontraram pela primeira vez e eu tive a certeza de que você era especial.',
    date: 'Nosso começo',
  },
  {
    id: '2',
    title: 'Por que eu te amo? ❤️',
    content: 'Pelo seu sorriso que ilumina meus dias mais difíceis, pela sua gentileza, pelo seu abraço que é o meu lugar favorito no mundo.',
    date: 'Para sempre',
  },
  {
    id: '3',
    title: 'Nossos Sonhos Juntos 🏡',
    content: 'Construir uma história linda, viajar o mundo juntos, rir até a barriga doer e envelhecer de mãos dadas.',
    date: 'O futuro',
  },
];

export const LoveNotesModal: React.FC<LoveNotesModalProps> = ({
  isOpen,
  onClose,
  partnerName,
}) => {
  const [notes, setNotes] = useState<LoveNote[]>(() => {
    const saved = localStorage.getItem('love_notes_data');
    return saved ? JSON.parse(saved) : DEFAULT_NOTES;
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const saveNotesToStorage = (updated: LoveNote[]) => {
    setNotes(updated);
    localStorage.setItem('love_notes_data', JSON.stringify(updated));
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newNote: LoveNote = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      content: newContent.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
    };

    const updated = [...notes, newNote];
    saveNotesToStorage(updated);
    setActiveNoteId(newNote.id);
    setNewTitle('');
    setNewContent('');
    setShowAddForm(false);
  };

  const handleDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = notes.filter((n) => n.id !== id);
    saveNotesToStorage(updated);
    if (activeNoteId === id) {
      setActiveNoteId(updated[0]?.id || null);
    }
  };

  const activeNote = notes.find((n) => n.id === activeNoteId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fff5f6] border border-pink-200 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-[#591424]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pink-100 bg-white/70">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-pink-500 fill-pink-100" />
            <h3 className="font-bold text-lg text-[#5c1626]">
              Cartinhas para {partnerName}
            </h3>
          </div>
          <button
            id="close-notes-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1 text-pink-700 hover:text-pink-900 rounded-full hover:bg-pink-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Note selector pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {notes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => {
                  setActiveNoteId(note.id);
                  setShowAddForm(false);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeNoteId === note.id && !showAddForm
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-white text-pink-800 border border-pink-200 hover:bg-pink-50'
                }`}
              >
                <Heart className={`w-3 h-3 ${activeNoteId === note.id && !showAddForm ? 'fill-white' : 'text-pink-500'}`} />
                <span>{note.title}</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                showAddForm
                  ? 'bg-pink-600 text-white'
                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova cartinha</span>
            </button>
          </div>

          {/* Add Form */}
          {showAddForm ? (
            <form onSubmit={handleAddNote} className="bg-white p-4 rounded-xl border border-pink-200 space-y-3">
              <h4 className="text-xs font-bold text-pink-800 uppercase tracking-wider">
                Escrever Nova Cartinha
              </h4>
              <input
                type="text"
                placeholder="Título (ex: Nosso Primeiro Beijo)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-pink-50/50 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
              <textarea
                rows={4}
                placeholder="Escreva sua mensagem com carinho..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-pink-50/50 rounded-lg border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 leading-relaxed"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-pink-600 hover:bg-pink-700 text-white rounded-lg shadow-sm"
                >
                  Salvar Cartinha
                </button>
              </div>
            </form>
          ) : activeNote ? (
            /* Active note envelope card */
            <div className="bg-white p-5 rounded-2xl border border-pink-200 shadow-sm relative space-y-3">
              <div className="flex items-center justify-between border-b border-pink-100 pb-2">
                <div>
                  <h4 className="font-bold text-base text-[#5c1626] font-serif-romantic">
                    {activeNote.title}
                  </h4>
                  {activeNote.date && (
                    <span className="text-[11px] text-pink-400">
                      {activeNote.date}
                    </span>
                  )}
                </div>
                {notes.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteNote(activeNote.id, e)}
                    className="p-1 text-pink-300 hover:text-red-500 rounded-full transition-colors"
                    title="Excluir cartinha"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#5c1627] leading-relaxed whitespace-pre-wrap">
                {activeNote.content}
              </p>
            </div>
          ) : (
            <p className="text-center text-xs text-pink-400 py-8">
              Nenhuma cartinha encontrada. Clique em &quot;Nova cartinha&quot; para adicionar uma!
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-pink-100 bg-white/70 flex justify-end">
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
