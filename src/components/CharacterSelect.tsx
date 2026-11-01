import React, { useEffect, useRef, useState } from 'react';
import { drawCharacter } from '../canvas/drawCharacters';
import { CharacterId, TimeOfDay, WeatherType } from '../types/game';
import { soundManager } from '../utils/audio';
import { CHARACTERS } from '../utils/characters';
import { getBlackSeeds, getHighScore } from '../utils/storage';

interface CharacterSelectProps {
  selectedId: CharacterId;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  onSelectCharacter: (id: CharacterId) => void;
  onSelectTimeOfDay: (tod: TimeOfDay) => void;
  onSelectWeather: (weather: WeatherType) => void;
  onOpenShop: () => void;
  onStartGame: () => void;
  onToast: (text: string, title?: string, charId?: CharacterId, category?: 'select' | 'hit' | 'dodge' | 'shop' | 'seed') => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  selectedId,
  timeOfDay,
  weather,
  onSelectCharacter,
  onSelectTimeOfDay,
  onSelectWeather,
  onOpenShop,
  onStartGame,
  onToast,
}) => {
  const [activeId, setActiveId] = useState<CharacterId>(selectedId);
  const canvasRefs = useRef<Record<CharacterId, HTMLCanvasElement | null>>({
    bibendum: null,
    baldi: null,
    neighbor: null,
  });
  const animRef = useRef<number>(0);
  const highScore = getHighScore();
  const blackSeeds = getBlackSeeds();

  const todList: Array<{ id: TimeOfDay; label: string; icon: string }> = [
    { id: 'sunrise', label: 'Gün Doğumu', icon: '🌅' },
    { id: 'noon', label: 'Öğle', icon: '☀️' },
    { id: 'sunset', label: 'Gün Batımı', icon: '🌇' },
    { id: 'night', label: 'Gece', icon: '🌙' },
  ];

  const weatherList: Array<{ id: WeatherType; label: string; icon: string }> = [
    { id: 'clear', label: 'Güneşli', icon: '☀️' },
    { id: 'rain', label: 'Yağmur', icon: '🌧️' },
    { id: 'snow', label: 'Karlı', icon: '❄️' },
  ];

  // Animate Character Previews on Canvas
  useEffect(() => {
    let frame = 0;
    let running = true;

    const renderPreviews = () => {
      frame++;

      (Object.keys(CHARACTERS) as CharacterId[]).forEach((id) => {
        const cvs = canvasRefs.current[id];
        if (cvs) {
          const ctx = cvs.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, cvs.width, cvs.height);

            // Draw shadow background platform
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(cvs.width * 0.5, cvs.height - 25, 45, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Glow ring for active character
            if (id === activeId) {
              ctx.strokeStyle = CHARACTERS[id].color;
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.ellipse(cvs.width * 0.5, cvs.height - 25, 52, 16, 0, 0, Math.PI * 2);
              ctx.stroke();
            }

            const isSelected = id === activeId;
            const animState = isSelected ? 'run' : 'idle';

            drawCharacter({
              ctx,
              id,
              x: cvs.width * 0.5,
              y: cvs.height - 25,
              width: 75,
              height: 110,
              state: animState,
              animFrame: frame,
              hasActiveShield: CHARACTERS[id].hasShield,
              scale: isSelected ? 1.05 : 0.95,
            });
          }
        }
      });

      if (running) {
        animRef.current = requestAnimationFrame(renderPreviews);
      }
    };

    renderPreviews();

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
    };
  }, [activeId]);

  const selectQuotes: Record<CharacterId, string[]> = {
    bibendum: [
      "Beni seçtin amk, tekerlek gibi ezip geçecem!",
      "Michelin Adamı sahada piçler, yol verin!",
      "Kalkanım hazır, basın gaza amına koyayım!"
    ],
    baldi: [
      "2 kere 2 kaç eder piç? Ders başlıyor!",
      "Cetvel elimde, yanlış yapana sıfırı veririm!",
      "2X puan kazanmaya hazır mısın oç!"
    ],
    neighbor: [
      "Bodrumun kapısı açık amk, zıplamaya geldim!",
      "Koca bıyığımı yalayacak mısınız piçler!",
      "Çift zıplarım belanızı sikerim!"
    ],
  };

  const handleSelect = (id: CharacterId) => {
    soundManager.playClick();
    setActiveId(id);
    onSelectCharacter(id);

    // Trigger instant curse toast on selection!
    const quotes = selectQuotes[id];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    onToast(quote, `${CHARACTERS[id].name} Seçildi!`, id, 'select');
    soundManager.speakVoice(id, 'jump');
  };

  const handleStart = () => {
    soundManager.playClick();
    onStartGame();
  };

  const activeChar = CHARACTERS[activeId];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-between p-3 md:p-6 overflow-y-auto z-50 select-none">
      {/* Top Navigation Bar: Shop & Time of Day */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto gap-2 flex-wrap">
        <button
          onClick={onOpenShop}
          className="py-2 px-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs md:text-sm rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center gap-2 cursor-pointer"
        >
          <span>🛒 MAĞAZA</span>
          <span className="bg-slate-950 text-amber-400 px-2 py-0.5 rounded-xl font-mono text-xs">
            🌻 {blackSeeds}
          </span>
        </button>

        {/* Time of Day & Weather Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Time of Day Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-2xl">
            {todList.map((tod) => (
              <button
                key={tod.id}
                onClick={() => {
                  soundManager.playClick();
                  onSelectTimeOfDay(tod.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  timeOfDay === tod.id
                    ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{tod.icon}</span>
                <span className="hidden sm:inline">{tod.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Weather Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-sky-600/50 p-1 rounded-2xl">
            {weatherList.map((w) => (
              <button
                key={w.id}
                onClick={() => {
                  soundManager.playClick();
                  onSelectWeather(w.id);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  weather === w.id
                    ? 'bg-sky-400 text-slate-950 shadow-md font-extrabold'
                    : 'text-sky-300/60 hover:text-sky-200'
                }`}
              >
                <span>{w.icon}</span>
                <span className="hidden sm:inline">{w.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="text-center mt-2">
        <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300 mb-1">
          <span>⚡ SİYAH ÇEKİRDEK & KÜFÜR MAĞAZALI 2D RUNNER</span>
          <span className="text-indigo-400">·</span>
          <span>REKOR: {highScore} P</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
          EFSANE KOŞUCU
        </h1>
      </div>

      {/* Character Cards Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto w-full my-4">
        {(Object.keys(CHARACTERS) as CharacterId[]).map((id) => {
          const char = CHARACTERS[id];
          const isSelected = id === activeId;

          return (
            <div
              key={id}
              onClick={() => handleSelect(id)}
              className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-300 flex flex-col items-center justify-between border-2 ${
                isSelected
                  ? 'bg-slate-800/90 border-amber-400 shadow-xl shadow-amber-500/20 scale-105'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-3 bg-amber-400 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                  SEÇİLDİ
                </div>
              )}

              {/* Canvas Character Preview */}
              <canvas
                ref={(el) => {
                  canvasRefs.current[id] = el;
                }}
                width={160}
                height={150}
                className="w-40 h-36 object-contain pointer-events-none"
              />

              {/* Title & Name */}
              <div className="text-center w-full mt-2">
                <h3 className="text-xl font-bold text-white tracking-wide">{char.name}</h3>
                <p className="text-xs text-slate-400 font-medium mb-3">{char.title}</p>

                {/* Special Ability Pill */}
                <div
                  className="w-full rounded-xl p-2.5 text-left text-xs mb-3 flex items-start gap-2 border"
                  style={{
                    backgroundColor: `${char.color}15`,
                    borderColor: `${char.color}40`,
                  }}
                >
                  <span className="text-lg shrink-0">{char.abilityIcon}</span>
                  <div>
                    <div className="font-bold text-slate-100">{char.abilityName}</div>
                    <div className="text-[11px] text-slate-300 leading-tight mt-0.5">
                      {char.abilityDescription}
                    </div>
                  </div>
                </div>

                {/* Stat Meters */}
                <div className="space-y-1.5 text-[11px] text-slate-300 w-full">
                  <div className="flex items-center justify-between">
                    <span>Hız:</span>
                    <div className="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400"
                        style={{ width: `${char.stats.speed}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Zıplama:</span>
                    <div className="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400"
                        style={{ width: `${char.stats.jumpPower}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Savunma:</span>
                    <div className="w-24 bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: `${char.stats.defense}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Start Button & Controls Hint */}
      <div className="max-w-md mx-auto w-full text-center mb-2">
        <button
          onClick={handleStart}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xl rounded-2xl shadow-lg shadow-orange-500/30 transform active:scale-95 transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>OYUNA BAŞLA ({activeChar.name})</span>
          <span className="text-2xl">➔</span>
        </button>

        <div className="mt-3 text-[11px] text-slate-400 flex items-center justify-center gap-4 flex-wrap">
          <span>👆 Ekrana Dokun veya Butonları Kullan</span>
          <span>·</span>
          <span>⌨️ W / Space = Zıpla | S = Eğil</span>
        </div>
      </div>
    </div>
  );
};
