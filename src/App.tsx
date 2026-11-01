import { useRef, useState } from 'react';
import { AchievementUnlockBanner } from './components/AchievementUnlockBanner';
import { AchievementsModal } from './components/AchievementsModal';
import { CharacterSelect } from './components/CharacterSelect';
import { GameCanvas } from './components/GameCanvas';
import { GameOverModal } from './components/GameOverModal';
import { HUD } from './components/HUD';
import { LandscapeNotice } from './components/LandscapeNotice';
import { PauseModal } from './components/PauseModal';
import { ShopModal } from './components/ShopModal';
import { ToastContainer } from './components/ToastContainer';
import { Achievement, CharacterId, GameState, TimeOfDay, ToastMessage, WeatherType } from './types/game';
import { soundManager } from './utils/audio';
import { CHARACTERS } from './utils/characters';
import {
  addBlackSeeds,
  getBlackSeeds,
  getHighScore,
  getLastCharacter,
  getTimeOfDay,
  getWeather,
  saveHighScore,
  saveLastCharacter,
  saveTimeOfDay,
  saveWeather,
  updateGameStats,
} from './utils/storage';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SELECT');
  const [selectedCharId, setSelectedCharId] = useState<CharacterId>(getLastCharacter());
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay());
  const [weather, setWeather] = useState<WeatherType>(getWeather());
  const [blackSeeds, setBlackSeeds] = useState<number>(getBlackSeeds());
  const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [unlockedBanner, setUnlockedBanner] = useState<Achievement | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(getHighScore());
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(3);
  const [hasShield, setHasShield] = useState<boolean>(CHARACTERS[selectedCharId].hasShield);
  const [jumpsRemaining, setJumpsRemaining] = useState<number>(CHARACTERS[selectedCharId].maxJumps);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [collectiblesCount, setCollectiblesCount] = useState<number>(0);

  // Refs for triggering jump / slide from HUD touch buttons
  const jumpTriggerRef = useRef<(() => void) | null>(null);
  const slideTriggerRef = useRef<(() => void) | null>(null);

  const character = CHARACTERS[selectedCharId];

  const handleUnlockAchievement = (ach: Achievement) => {
    soundManager.playCollect('key');
    setUnlockedBanner(ach);
    setBlackSeeds(getBlackSeeds());
    handleToast(`🏆 Başarım Açıldı: ${ach.title} (+${ach.rewardSeed} 🌻)`, 'BAŞARIM AÇILDI', selectedCharId, 'seed');

    setTimeout(() => {
      setUnlockedBanner((current) => (current?.id === ach.id ? null : current));
    }, 4500);
  };

  const handleToast = (
    text: string,
    title?: string,
    charId?: CharacterId,
    category: 'hit' | 'dodge' | 'select' | 'shop' | 'seed' = 'hit'
  ) => {
    const id = Math.random().toString();
    const newToast: ToastMessage = {
      id,
      text,
      title,
      category,
      characterId: charId || selectedCharId,
    };

    setToasts((prev) => [newToast, ...prev.slice(0, 2)]); // Keep max 3 toasts

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const handleSelectCharacter = (id: CharacterId) => {
    setSelectedCharId(id);
    saveLastCharacter(id);
    setHasShield(CHARACTERS[id].hasShield);
    setJumpsRemaining(CHARACTERS[id].maxJumps);
  };

  const handleToggleTimeOfDay = () => {
    soundManager.playClick();
    const todSequence: TimeOfDay[] = ['sunrise', 'noon', 'sunset', 'night'];
    const nextTod = todSequence[(todSequence.indexOf(timeOfDay) + 1) % todSequence.length];
    setTimeOfDay(nextTod);
    saveTimeOfDay(nextTod);

    const labels: Record<TimeOfDay, string> = {
      sunrise: 'Gün Doğumu 🌅',
      noon: 'Öğle ☀️',
      sunset: 'Gün Batımı 🌇',
      night: 'Gece 🌙',
    };
    handleToast(`Günün zamanı: ${labels[nextTod]} olarak ayarlandı!`, 'ZAMAN DEĞİŞTİ', undefined, 'select');
  };

  const handleToggleWeather = () => {
    soundManager.playClick();
    const weatherSequence: WeatherType[] = ['clear', 'rain', 'snow'];
    const nextWeather = weatherSequence[(weatherSequence.indexOf(weather) + 1) % weatherSequence.length];
    setWeather(nextWeather);
    saveWeather(nextWeather);

    const labels: Record<WeatherType, string> = {
      clear: 'Güneşli ☀️',
      rain: 'Yağmurlu 🌧️',
      snow: 'Karlı ❄️',
    };
    handleToast(`Hava durumu: ${labels[nextWeather]} olarak değişti!`, 'HAVA DEĞİŞTİ', undefined, 'select');
  };

  const handleSelectWeather = (w: WeatherType) => {
    setWeather(w);
    saveWeather(w);
    const labels: Record<WeatherType, string> = {
      clear: 'Güneşli ☀️',
      rain: 'Yağmurlu 🌧️',
      snow: 'Karlı ❄️',
    };
    handleToast(`Hava durumu: ${labels[w]} seçildi!`, 'HAVA SEÇİLDİ', undefined, 'select');
  };

  const handleStartGame = () => {
    setScore(0);
    setLives(3);
    setCollectiblesCount(0);
    setIsNewRecord(false);
    setHasShield(character.hasShield);
    setJumpsRemaining(character.maxJumps);
    setGameState('PLAYING');
  };

  const handlePause = () => {
    if (gameState === 'PLAYING') {
      soundManager.playClick();
      setGameState('PAUSED');
    }
  };

  const handleResume = () => {
    if (gameState === 'PAUSED') {
      soundManager.playClick();
      setGameState('PLAYING');
    }
  };

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const handleGameOver = () => {
    const record = saveHighScore(score);
    setIsNewRecord(record);
    if (record) {
      setHighScore(score);
      handleToast("🏆 YENİ REKOR KIRILDI AMK!", "ŞAMPİYON REKORU", selectedCharId, "select");
    }
    updateGameStats(selectedCharId, collectiblesCount);
    setGameState('GAMEOVER');
  };

  const handleChangeCharacter = () => {
    setGameState('SELECT');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none touch-none">
      <LandscapeNotice />
      <ToastContainer toasts={toasts} />
      <AchievementUnlockBanner achievement={unlockedBanner} onClose={() => setUnlockedBanner(null)} />

      {gameState === 'SELECT' && (
        <CharacterSelect
          selectedId={selectedCharId}
          timeOfDay={timeOfDay}
          weather={weather}
          onSelectCharacter={handleSelectCharacter}
          onSelectTimeOfDay={(tod) => {
            setTimeOfDay(tod);
            saveTimeOfDay(tod);
          }}
          onSelectWeather={handleSelectWeather}
          onOpenShop={() => {
            soundManager.playClick();
            setIsShopOpen(true);
          }}
          onStartGame={handleStartGame}
          onToast={handleToast}
        />
      )}

      {gameState !== 'SELECT' && (
        <>
          <GameCanvas
            character={character}
            timeOfDay={timeOfDay}
            weather={weather}
            isPaused={gameState === 'PAUSED'}
            isGameOver={gameState === 'GAMEOVER'}
            onUpdateScore={(updater) => setScore(updater)}
            onUpdateLives={(updater) => setLives(updater)}
            onUpdateBlackSeeds={(updater) => setBlackSeeds(updater)}
            onGameOver={handleGameOver}
            onUpdateShield={(active) => setHasShield(active)}
            onUpdateJumpsRemaining={(jumps) => setJumpsRemaining(jumps)}
            onToast={handleToast}
            onUnlockAchievement={handleUnlockAchievement}
            hasShield={hasShield}
            jumpTriggerRef={jumpTriggerRef}
            slideTriggerRef={slideTriggerRef}
          />

          <HUD
            score={score}
            highScore={highScore}
            blackSeeds={blackSeeds}
            lives={lives}
            maxLives={3}
            character={character}
            hasShield={hasShield}
            jumpsRemaining={jumpsRemaining}
            timeOfDay={timeOfDay}
            weather={weather}
            isMuted={isMuted}
            onToggleTimeOfDay={handleToggleTimeOfDay}
            onToggleWeather={handleToggleWeather}
            onOpenShop={() => {
              soundManager.playClick();
              setIsShopOpen(true);
            }}
            onOpenAchievements={() => {
              soundManager.playClick();
              setIsAchievementsOpen(true);
            }}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
            onJumpStart={() => jumpTriggerRef.current?.()}
            onJumpEnd={() => {}}
            onSlideStart={() => slideTriggerRef.current?.()}
            onSlideEnd={() => {}}
          />
        </>
      )}

      {isShopOpen && (
        <ShopModal
          onClose={() => setIsShopOpen(false)}
          onToast={(msg, title) => handleToast(msg, title, undefined, 'shop')}
        />
      )}

      {isAchievementsOpen && (
        <AchievementsModal onClose={() => setIsAchievementsOpen(false)} />
      )}

      {gameState === 'PAUSED' && (
        <PauseModal
          character={character}
          score={score}
          onResume={handleResume}
          onRestart={handleStartGame}
          onChangeCharacter={handleChangeCharacter}
        />
      )}

      {gameState === 'GAMEOVER' && (
        <GameOverModal
          score={score}
          highScore={highScore}
          isNewRecord={isNewRecord}
          collectiblesCount={collectiblesCount}
          character={character}
          onRestart={handleStartGame}
          onChangeCharacter={handleChangeCharacter}
        />
      )}
    </div>
  );
}


