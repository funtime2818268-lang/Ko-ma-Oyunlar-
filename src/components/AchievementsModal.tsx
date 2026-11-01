import React from 'react';
import { soundManager } from '../utils/audio';
import { ACHIEVEMENTS } from '../utils/achievements';
import { getUnlockedAchievements } from '../utils/storage';

interface AchievementsModalProps {
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ onClose }) => {
  const unlocked = getUnlockedAchievements();
  const totalCount = ACHIEVEMENTS.length;
  const unlockedCount = unlocked.length;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-fadeIn">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 md:p-7 max-w-lg w-full text-center shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-black text-amber-400 leading-none">
                BAŞARIMLAR
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Görevleri tamamla, özel kupaları ve ekstra siyah çekirdekleri kazan!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Progress Tracker Bar */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3 my-3">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-300">TOPLAM KAZANILAN:</span>
            <span className="text-amber-400 tabular-nums font-black">
              {unlockedCount} / {totalCount} KUPA
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid List */}
        <div className="overflow-y-auto space-y-2.5 my-1 pr-1 text-left flex-1">
          {ACHIEVEMENTS.map((ach) => {
            const isUnlocked = unlocked.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isUnlocked
                    ? 'bg-amber-950/20 border-amber-500/60 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/40 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-xl shrink-0 ${
                      isUnlocked
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-700 grayscale'
                    }`}
                  >
                    {ach.icon}
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      <span>{ach.title}</span>
                      {isUnlocked && (
                        <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase">
                          KAZANILDI
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {ach.description}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-amber-400 flex items-center gap-1 justify-end">
                    <span>🌻 +{ach.rewardSeed}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close */}
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm rounded-2xl cursor-pointer"
          >
            KAPAT
          </button>
        </div>
      </div>
    </div>
  );
};
