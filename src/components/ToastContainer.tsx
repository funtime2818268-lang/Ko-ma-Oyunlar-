import React from 'react';
import { ToastMessage } from '../types/game';
import { CHARACTERS } from '../utils/characters';

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 max-w-sm w-full px-4 pointer-events-none select-none">
      {toasts.map((toast) => {
        const char = toast.characterId ? CHARACTERS[toast.characterId] : null;

        return (
          <div
            key={toast.id}
            className={`w-full p-3 rounded-2xl border-2 shadow-2xl flex items-center gap-3 animate-bounce backdrop-blur-md transform transition-all duration-300 ${
              toast.category === 'hit'
                ? 'bg-red-950/90 border-red-500 text-red-100 shadow-red-500/30'
                : toast.category === 'dodge'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-emerald-500/30'
                : toast.category === 'seed'
                ? 'bg-amber-950/90 border-amber-400 text-amber-100 shadow-amber-500/30'
                : 'bg-indigo-950/90 border-indigo-400 text-indigo-100 shadow-indigo-500/30'
            }`}
          >
            {/* Avatar / Category Badge */}
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-lg shadow-inner">
              {char ? char.abilityIcon : toast.category === 'hit' ? '💥' : toast.category === 'seed' ? '🌻' : '🗣️'}
            </div>

            {/* Message Body */}
            <div className="flex-1 text-left min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                {char ? `${char.name} Diyor ki:` : toast.title || 'OYUN MESAJI'}
              </div>
              <div className="text-xs font-black tracking-tight leading-snug break-words">
                "{toast.text}"
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
