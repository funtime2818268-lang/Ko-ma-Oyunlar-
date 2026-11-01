import React from 'react';
import { Achievement } from '../types/game';

interface AchievementUnlockBannerProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export const AchievementUnlockBanner: React.FC<AchievementUnlockBannerProps> = ({
  achievement,
  onClose,
}) => {
  if (!achievement) return null;

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4 animate-bounce pointer-events-auto select-none">
      <div className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-yellow-200 text-slate-950 p-3.5 rounded-3xl shadow-2xl flex items-center justify-between gap-3 relative overflow-hidden">
        {/* Glow Shimmer Background */}
        <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-amber-300 flex items-center justify-center text-2xl shadow-lg shrink-0">
            {achievement.icon}
          </div>

          <div className="text-left min-w-0">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 bg-yellow-300/80 px-2 py-0.5 rounded-full inline-block mb-0.5">
              🏆 BAŞARIM KAZANILDI!
            </div>
            <h3 className="text-sm font-black text-slate-950 tracking-tight leading-none">
              {achievement.title}
            </h3>
            <p className="text-[11px] text-slate-900 font-bold mt-0.5 line-clamp-1">
              {achievement.description} (+{achievement.rewardSeed} 🌻 Çekirdek)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full bg-slate-950 text-amber-300 font-bold text-xs flex items-center justify-center cursor-pointer shrink-0 relative z-10"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
