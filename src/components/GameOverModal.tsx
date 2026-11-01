import React from 'react';
import { CharacterConfig } from '../types/game';
import { soundManager } from '../utils/audio';

interface GameOverModalProps {
  score: number;
  highScore: number;
  isNewRecord: boolean;
  collectiblesCount: number;
  character: CharacterConfig;
  onRestart: () => void;
  onChangeCharacter: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  isNewRecord,
  collectiblesCount,
  character,
  onRestart,
  onChangeCharacter,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
      <div className="bg-slate-900 border-2 border-red-500/40 rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl space-y-5 relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

        {isNewRecord && (
          <div className="bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs py-1 px-4 rounded-full uppercase tracking-widest animate-bounce mx-auto max-w-xs shadow-md">
            🏆 YENİ REKOR! 🏆
          </div>
        )}

        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-black text-red-500 tracking-tight">GAME OVER</h2>
          <p className="text-xs text-slate-400">
            Karakter: <span className="text-white font-bold">{character.name}</span>
          </p>
        </div>

        {/* Score Summary Box */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-3">
          <div>
            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">SKORUN</div>
            <div className="text-4xl font-black text-amber-400 tabular-nums">{score}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60 text-xs">
            <div className="text-left">
              <span className="text-slate-400 block text-[10px]">EN YÜKSEK SKOR</span>
              <span className="font-extrabold text-white tabular-nums">{highScore}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">TOPLANAN ÖĞE</span>
              <span className="font-extrabold text-sky-400 tabular-nums">{collectiblesCount} Adet</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          <button
            onClick={() => {
              soundManager.playClick();
              onRestart();
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-lg rounded-2xl shadow-lg shadow-orange-500/30 active:scale-95 transition-transform cursor-pointer"
          >
            🔄 TEKRAR OYNA
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onChangeCharacter();
            }}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-sm rounded-2xl active:scale-95 transition-transform cursor-pointer"
          >
            👤 KARAKTER DEĞİŞTİR
          </button>
        </div>
      </div>
    </div>
  );
};
