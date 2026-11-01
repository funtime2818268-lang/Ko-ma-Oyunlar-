import { Achievement, CharacterId, TimeOfDay } from '../types/game';
import { addBlackSeeds, getUnlockedAchievements, unlockAchievement } from './storage';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'İlk Adım',
    description: 'Oyunda 100 skor yap!',
    icon: '🏃',
    rewardSeed: 5,
  },
  {
    id: 'runner_pro',
    title: 'Usta Koşucu',
    description: 'Oyunda 500 skora ulaş!',
    icon: '⚡',
    rewardSeed: 15,
  },
  {
    id: 'speed_god',
    title: 'Hız Tanrısı',
    description: 'Oyunda 1000 skor rekoru kır!',
    icon: '🏆',
    rewardSeed: 30,
  },
  {
    id: 'seed_collector',
    title: 'Çekirdek Bağımlısı',
    description: 'Toplam 25 Siyah Çekirdek topla!',
    icon: '🌻',
    rewardSeed: 10,
  },
  {
    id: 'michelin_shield',
    title: 'Michelin Kalkan Ustası',
    description: 'Bibendum ile 1 kalkan kullanarak engeli aş!',
    icon: '🛡️',
    rewardSeed: 10,
  },
  {
    id: 'baldi_math',
    title: 'Matematik Dahisi',
    description: 'Baldi ile 2x çarpan kullanarak 300 skor yap!',
    icon: '📐',
    rewardSeed: 15,
  },
  {
    id: 'neighbor_double_jump',
    title: 'Bodrum Kaçkını',
    description: 'Hello Neighbor ile Çift Zıplama yap!',
    icon: '🔑',
    rewardSeed: 10,
  },
  {
    id: 'night_owl',
    title: 'Gece Kuşu',
    description: 'Gece modunda 200 skor yap!',
    icon: '🌙',
    rewardSeed: 15,
  },
];

export interface CheckAchievementsContext {
  score: number;
  characterId: CharacterId;
  timeOfDay: TimeOfDay;
  totalBlackSeeds: number;
  usedShield?: boolean;
  didDoubleJump?: boolean;
}

export function checkAchievements(
  context: CheckAchievementsContext,
  onUnlock: (achievement: Achievement) => void
) {
  const unlocked = getUnlockedAchievements();

  ACHIEVEMENTS.forEach((ach) => {
    if (unlocked.includes(ach.id)) return;

    let shouldUnlock = false;

    if (ach.id === 'first_step' && context.score >= 100) {
      shouldUnlock = true;
    } else if (ach.id === 'runner_pro' && context.score >= 500) {
      shouldUnlock = true;
    } else if (ach.id === 'speed_god' && context.score >= 1000) {
      shouldUnlock = true;
    } else if (ach.id === 'seed_collector' && context.totalBlackSeeds >= 25) {
      shouldUnlock = true;
    } else if (ach.id === 'michelin_shield' && context.characterId === 'bibendum' && context.usedShield) {
      shouldUnlock = true;
    } else if (ach.id === 'baldi_math' && context.characterId === 'baldi' && context.score >= 300) {
      shouldUnlock = true;
    } else if (ach.id === 'neighbor_double_jump' && context.characterId === 'neighbor' && context.didDoubleJump) {
      shouldUnlock = true;
    } else if (ach.id === 'night_owl' && context.timeOfDay === 'night' && context.score >= 200) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      unlockAchievement(ach.id);
      addBlackSeeds(ach.rewardSeed);
      onUnlock(ach);
    }
  });
}
