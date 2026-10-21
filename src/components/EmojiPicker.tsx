import React from 'react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Popular & Reactions',
    emojis: ['❤️', '😂', '🔥', '👍', '🙏', '🎉', '😍', '✨', '👏', '🥳', '😎', '🏖️'],
  },
  {
    name: 'Smileys & People',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '🥰', '😘', '😋', '😜', '🤪', '🤫', '🤔', '🤐', '🤨', '😐', '😑'],
  },
  {
    name: 'Squad & Activities',
    emojis: ['📸', '🎥', '🍿', '🎸', '🎮', '⚽', '🏐', '☕', '🍕', '🍔', '🧁', '🍦', '🚗', '✈️', '🏝️', '🌅', '⛺', '🚀', '⭐', '🎈'],
  },
];

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  return (
    <div className="absolute bottom-14 left-2 z-40 bg-white shadow-2xl rounded-2xl border border-slate-200 w-72 sm:w-80 max-h-80 overflow-y-auto p-3 animate-in zoom-in-95 duration-100">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-600">
        <span>Emojis & Reactions</span>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 text-sm px-1.5 py-0.5 rounded"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3 pt-2">
        {EMOJI_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <p className="text-[11px] font-semibold text-slate-400 mb-1">{cat.name}</p>
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-1">
              {cat.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onSelectEmoji(emoji);
                  }}
                  className="text-xl p-1.5 hover:bg-slate-100 rounded-lg transition-transform active:scale-125 flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
