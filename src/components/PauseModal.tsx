import React from 'react';
import { CharacterConfig } from '../types/game';
import { soundManager } from '../utils/audio';

interface PauseModalProps {
  character: CharacterConfig;
  score: number;
  onResume: () => void;
  onRestart: () => void;
  onChangeCharacter: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  character,
  score,
  onResume,
  onRestart,
  onChangeCharacter,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl space-y-5">
        <div className="space-y-1">
          <div className="text-3xl">⏸️</div>
          <h2 className="text-2xl md:text-3xl font-black text-amber-400">OYUN DURAKLATILDI</h2>
          <p className="text-xs text-slate-400">
            Aktif Karakter: <strong className="text-white">{character.name}</strong>
          </p>
        </div>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">ANLIK SKOR</div>
          <div className="text-3xl font-black text-white tabular-nums">{score}</div>
        </div>

        <div className="space-y-2.5 w-full">
          <button
            onClick={() => {
              soundManager.playClick();
              onResume();
            }}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer"
          >
            ▶️ DEVAM ET
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded-2xl active:scale-95 transition-transform cursor-pointer"
          >
            🔄 YENİDEN BAŞLAT
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onChangeCharacter();
            }}
            className="w-full py-3 px-4 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs rounded-2xl active:scale-95 transition-transform cursor-pointer"
          >
            👤 KARAKTER DEĞİŞTİR
          </button>
        </div>
      </div>
    </div>
  );
};
