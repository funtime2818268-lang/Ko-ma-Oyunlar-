import { CharacterId, TimeOfDay } from '../types/game';

const HIGH_SCORE_KEY = 'endless_runner_high_score';
const LAST_CHARACTER_KEY = 'endless_runner_last_char';
const STATS_KEY = 'endless_runner_stats';
const TIME_OF_DAY_KEY = 'endless_runner_tod';
const BLACK_SEEDS_KEY = 'endless_runner_black_seeds';
const UNLOCKED_SHOP_ITEMS_KEY = 'endless_runner_shop_unlocked';

export interface GameStats {
  totalRuns: number;
  totalCollectibles: number;
  bibendumRuns: number;
  baldiRuns: number;
  neighborRuns: number;
}

export function getHighScore(): number {
  try {
    const val = localStorage.getItem(HIGH_SCORE_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function saveHighScore(score: number): boolean {
  try {
    const current = getHighScore();
    if (score > current) {
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      return true; // New High Score record!
    }
    return false;
  } catch {
    return false;
  }
}

export function getLastCharacter(): CharacterId {
  try {
    const val = localStorage.getItem(LAST_CHARACTER_KEY) as CharacterId;
    if (val === 'bibendum' || val === 'baldi' || val === 'neighbor') {
      return val;
    }
  } catch {
    // fallback
  }
  return 'bibendum';
}

export function saveLastCharacter(id: CharacterId): void {
  try {
    localStorage.setItem(LAST_CHARACTER_KEY, id);
  } catch {
    // fallback
  }
}

export function getTimeOfDay(): TimeOfDay {
  try {
    const val = localStorage.getItem(TIME_OF_DAY_KEY) as TimeOfDay;
    if (val === 'sunrise' || val === 'noon' || val === 'sunset' || val === 'night') {
      return val;
    }
  } catch {
    // fallback
  }
  return 'sunset';
}

export function saveTimeOfDay(tod: TimeOfDay): void {
  try {
    localStorage.setItem(TIME_OF_DAY_KEY, tod);
  } catch {
    // fallback
  }
}

const WEATHER_KEY = 'endless_runner_weather';

export function getWeather(): 'clear' | 'rain' | 'snow' {
  try {
    const val = localStorage.getItem(WEATHER_KEY) as 'clear' | 'rain' | 'snow';
    if (val === 'clear' || val === 'rain' || val === 'snow') {
      return val;
    }
  } catch {
    // fallback
  }
  return 'clear';
}

export function saveWeather(weather: 'clear' | 'rain' | 'snow'): void {
  try {
    localStorage.setItem(WEATHER_KEY, weather);
  } catch {
    // fallback
  }
}

export function getBlackSeeds(): number {
  try {
    const val = localStorage.getItem(BLACK_SEEDS_KEY);
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function addBlackSeeds(amount: number): number {
  try {
    const current = getBlackSeeds();
    const updated = current + amount;
    localStorage.setItem(BLACK_SEEDS_KEY, updated.toString());
    return updated;
  } catch {
    return getBlackSeeds();
  }
}

export function deductBlackSeeds(amount: number): boolean {
  try {
    const current = getBlackSeeds();
    if (current >= amount) {
      const updated = current - amount;
      localStorage.setItem(BLACK_SEEDS_KEY, updated.toString());
      return true;
    }
  } catch {
    // fallback
  }
  return false;
}

export function getUnlockedShopItems(): string[] {
  try {
    const val = localStorage.getItem(UNLOCKED_SHOP_ITEMS_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function unlockShopItem(itemId: string): string[] {
  try {
    const unlocked = getUnlockedShopItems();
    if (!unlocked.includes(itemId)) {
      unlocked.push(itemId);
      localStorage.setItem(UNLOCKED_SHOP_ITEMS_KEY, JSON.stringify(unlocked));
    }
    return unlocked;
  } catch {
    return getUnlockedShopItems();
  }
}

export function getGameStats(): GameStats {
  try {
    const data = localStorage.getItem(STATS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // fallback
  }
  return {
    totalRuns: 0,
    totalCollectibles: 0,
    bibendumRuns: 0,
    baldiRuns: 0,
    neighborRuns: 0,
  };
}

export function updateGameStats(charId: CharacterId, collectiblesCount: number): GameStats {
  const stats = getGameStats();
  stats.totalRuns += 1;
  stats.totalCollectibles += collectiblesCount;
  if (charId === 'bibendum') stats.bibendumRuns += 1;
  if (charId === 'baldi') stats.baldiRuns += 1;
  if (charId === 'neighbor') stats.neighborRuns += 1;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }

  return stats;
}

const UNLOCKED_ACHIEVEMENTS_KEY = 'endless_runner_achievements_unlocked';

export function getUnlockedAchievements(): string[] {
  try {
    const val = localStorage.getItem(UNLOCKED_ACHIEVEMENTS_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function unlockAchievement(id: string): string[] {
  try {
    const unlocked = getUnlockedAchievements();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem(UNLOCKED_ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
    }
    return unlocked;
  } catch {
    return getUnlockedAchievements();
  }
}


