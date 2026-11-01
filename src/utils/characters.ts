import { CharacterConfig, CharacterId } from '../types/game';

export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  bibendum: {
    id: 'bibendum',
    name: 'Bibendum',
    title: 'Michelin Adamı',
    color: '#3b82f6', // Bright Blue
    accentColor: '#1d4ed8',
    abilityName: '1-Defa Hasar Kalkanı',
    abilityDescription: 'Oyuna 1 engeli tamamen yok sayan enerjik mavi kalkan ile başlar!',
    abilityIcon: '🛡️',
    hasShield: true,
    scoreMultiplier: 1,
    maxJumps: 1,
    stats: {
      speed: 85,
      jumpPower: 80,
      defense: 100,
    },
  },
  baldi: {
    id: 'baldi',
    name: 'Baldi',
    title: 'Matematik Öğretmeni',
    color: '#22c55e', // Vibrant Green
    accentColor: '#15803d',
    abilityName: '2x Puan Çarpanı',
    abilityDescription: 'Tüm kat edilen mesafe ve toplanan eşyalardan 2 KAT ekstra puan kazanır!',
    abilityIcon: '📐',
    hasShield: false,
    scoreMultiplier: 2,
    maxJumps: 1,
    stats: {
      speed: 90,
      jumpPower: 85,
      defense: 70,
    },
  },
  neighbor: {
    id: 'neighbor',
    name: 'Hello Neighbor',
    title: 'Gizemli Komşu',
    color: '#f97316', // Orange
    accentColor: '#c2410c',
    abilityName: 'Çift Zıplama',
    abilityDescription: 'Havada tekrar zıplayabilir! Yüksek engelleri kolayca aşar.',
    abilityIcon: '🔑',
    hasShield: false,
    scoreMultiplier: 1,
    maxJumps: 2,
    stats: {
      speed: 95,
      jumpPower: 95,
      defense: 75,
    },
  },
};
