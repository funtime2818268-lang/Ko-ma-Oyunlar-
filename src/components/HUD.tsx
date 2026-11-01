import React from 'react';
import { CharacterConfig, TimeOfDay, WeatherType } from '../types/game';

interface HUDProps {
  score: number;
  highScore: number;
  blackSeeds: number;
  lives: number;
  maxLives: number;
  character: CharacterConfig;
  hasShield: boolean;
  jumpsRemaining: number;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  isMuted: boolean;
  onToggleTimeOfDay: () => void;
  onToggleWeather: () => void;
  onOpenShop: () => void;
  onOpenAchievements: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onJumpStart: () => void;
  onJumpEnd: () => void;
  onSlideStart: () => void;
  onSlideEnd: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  highScore,
  blackSeeds,
  lives,
  maxLives,
  character,
  hasShield,
  jumpsRemaining,
  timeOfDay,
  weather,
  isMuted,
  onToggleTimeOfDay,
  onToggleWeather,
  onOpenShop,
  onOpenAchievements,
  onToggleMute,
  onPause,
  onJumpStart,
  onJumpEnd,
  onSlideStart,
  onSlideEnd,
}) => {
  const todIcons: Record<TimeOfDay, string> = {
    sunrise: '🌅',
    noon: '☀️',
    sunset: '🌇',
    night: '🌙',
  };

  const todLabels: Record<TimeOfDay, string> = {
    sunrise: 'GÜN DOĞUMU',
    noon: 'ÖĞLE',
    sunset: 'GÜN BATIMI',
    night: 'GECE',
  };

  const weatherIcons: Record<WeatherType, string> = {
    clear: '☀️',
    rain: '🌧️',
    snow: '❄️',
  };

  const weatherLabels: Record<WeatherType, string> = {
    clear: 'GÜNEŞLİ',
    rain: 'YAĞMUR',
    snow: 'KARLI',
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 md:p-6 z-20 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto gap-2 flex-wrap sm:flex-nowrap">
        {/* Left: Hearts, Character Ability Badge & Black Seeds */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Health Bar (Can Barı) */}
          <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 px-2.5 py-1.5 rounded-2xl shadow-lg">
            <span className="text-[10px] font-extrabold text-slate-300 mr-0.5 hidden sm:inline">CAN:</span>
            {Array.from({ length: maxLives }).map((_, i) => (
              <span
                key={i}
                className={`text-base sm:text-xl transition-all duration-300 ${
                  i < lives ? 'scale-100 opacity-100' : 'scale-75 opacity-25 grayscale'
                }`}
              >
                ❤️
              </span>
            ))}
          </div>

          {/* Active Ability Indicator */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/60 px-2 py-1.5 rounded-2xl flex items-center gap-1 shadow-lg">
            <span className="text-base">{character.abilityIcon}</span>
            <span className="text-[11px] font-extrabold text-amber-300 hidden md:inline">
              {character.id === 'bibendum'
                ? hasShield
                  ? 'KALKAN'
                  : 'KIRIK'
                : character.id === 'baldi'
                ? '2X PUAN'
                : `ZIPLA (${jumpsRemaining}/${character.maxJumps})`}
            </span>
          </div>

          {/* Black Seeds Balance Display */}
          <div className="bg-slate-900/90 backdrop-blur-md border border-amber-500/50 px-2.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-lg">
            <span className="text-base">🌻</span>
            <span className="text-xs font-black text-amber-400 tabular-nums">{blackSeeds}</span>
          </div>
        </div>

        {/* Right: Scores & TimeOfDay / Shop / Achievements / Menu Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Score Box */}
          <div className="bg-slate-900/90 border border-amber-500/40 px-2.5 sm:px-4 py-1 rounded-2xl shadow-lg flex flex-col items-end">
            <div className="flex items-center gap-1">
              <span className="text-[9px] sm:text-[10px] text-amber-400 font-extrabold tracking-wider">SKOR</span>
              <span className="text-base sm:text-2xl font-black text-white tabular-nums tracking-tight">
                {score}
              </span>
            </div>
            {highScore > 0 && (
              <div className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tabular-nums hidden sm:block">
                EN YÜKSEK: {highScore}
              </div>
            )}
          </div>

          {/* Achievements Button */}
          <button
            onClick={onOpenAchievements}
            className="h-9 px-2.5 bg-slate-900/90 border border-amber-500/50 hover:border-amber-400 text-amber-300 font-bold rounded-2xl flex items-center gap-1 text-xs shadow-md active:scale-90 transition-transform cursor-pointer"
            title="Başarımlar"
          >
            <span>🏆</span>
            <span className="hidden lg:inline text-[10px] font-black">BAŞARIMLAR</span>
          </button>

          {/* Time of Day Cycle Button */}
          <button
            onClick={onToggleTimeOfDay}
            className="h-9 px-2.5 bg-slate-900/90 border border-slate-700 hover:border-slate-500 rounded-2xl flex items-center gap-1 text-xs font-bold text-slate-200 active:scale-90 transition-transform cursor-pointer"
            title={`Zamanı Değiştir (Şu an: ${todLabels[timeOfDay]})`}
          >
            <span>{todIcons[timeOfDay]}</span>
            <span className="hidden lg:inline text-[10px]">{todLabels[timeOfDay]}</span>
          </button>

          {/* Dynamic Weather Toggle Button */}
          <button
            onClick={onToggleWeather}
            className="h-9 px-2.5 bg-slate-900/90 border border-sky-500/50 hover:border-sky-400 text-sky-200 font-bold rounded-2xl flex items-center gap-1 text-xs shadow-md active:scale-90 transition-transform cursor-pointer"
            title={`Hava Durumunu Değiştir (Şu an: ${weatherLabels[weather]})`}
          >
            <span>{weatherIcons[weather]}</span>
            <span className="hidden lg:inline text-[10px]">{weatherLabels[weather]}</span>
          </button>

          {/* Shop Button */}
          <button
            onClick={onOpenShop}
            className="h-9 px-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black rounded-2xl flex items-center gap-1 text-xs shadow-md active:scale-90 transition-transform cursor-pointer"
            title="Çekirdek & Küfür Mağazası"
          >
            <span>🛒</span>
            <span className="hidden sm:inline font-extrabold">MAĞAZA</span>
          </button>

          {/* Sound Mute Toggle Button */}
          <button
            onClick={onToggleMute}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-900/90 border border-slate-700 hover:border-slate-500 rounded-2xl flex items-center justify-center text-base active:scale-90 transition-transform cursor-pointer"
            title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl flex items-center justify-center text-base shadow-md active:scale-90 transition-transform cursor-pointer"
            title="Duraklat"
          >
            ⏸️
          </button>
        </div>
      </div>

      {/* Touch Swipe / Key Hint Banner (Fade out hint) */}
      <div className="self-center bg-slate-950/70 border border-slate-800 text-slate-300 text-[11px] font-semibold px-4 py-1 rounded-full shadow-md backdrop-blur-xs opacity-75">
        <span>👆 Yukarı Kaydır = Zıpla | Aşağı Kaydır = Eğil</span>
      </div>

      {/* On-Screen Virtual Touch Controls (Dokunmatik Sanal Butonlar) */}
      <div className="flex items-center justify-between w-full pointer-events-auto pb-2 px-1">
        {/* Left Bottom Corner: EĞİL / KAYS */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onSlideStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onSlideEnd();
          }}
          onMouseDown={onSlideStart}
          onMouseUp={onSlideEnd}
          className="w-28 h-24 sm:w-36 sm:h-28 bg-gradient-to-t from-slate-900/90 via-slate-800/80 to-slate-700/60 border-2 border-sky-400/60 active:border-sky-300 active:bg-sky-500/40 text-white rounded-3xl flex flex-col items-center justify-center gap-1 shadow-2xl shadow-sky-500/20 active:scale-95 transition-all duration-100 cursor-pointer touch-none select-none backdrop-blur-xs"
        >
          <span className="text-2xl sm:text-3xl">👇</span>
          <span className="font-black text-sm sm:text-base tracking-wider text-sky-200">
            EĞİL / KAYS
          </span>
        </button>

        {/* Right Bottom Corner: ZIPLA */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJumpStart();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onJumpEnd();
          }}
          onMouseDown={onJumpStart}
          onMouseUp={onJumpEnd}
          className="w-28 h-24 sm:w-36 sm:h-28 bg-gradient-to-t from-amber-900/90 via-amber-700/80 to-amber-600/60 border-2 border-amber-400/80 active:border-amber-300 active:bg-amber-500/50 text-white rounded-3xl flex flex-col items-center justify-center gap-1 shadow-2xl shadow-amber-500/30 active:scale-95 transition-all duration-100 cursor-pointer touch-none select-none backdrop-blur-xs"
        >
          <span className="text-2xl sm:text-3xl">🚀</span>
          <span className="font-black text-sm sm:text-base tracking-wider text-amber-200">
            ZIPLA
          </span>
        </button>
      </div>
    </div>
  );
};
