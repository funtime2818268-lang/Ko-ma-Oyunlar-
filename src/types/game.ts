/**
 * Game Types & Interfaces
 */

export type CharacterId = 'bibendum' | 'baldi' | 'neighbor';

export type TimeOfDay = 'sunrise' | 'noon' | 'sunset' | 'night';

export type WeatherType = 'clear' | 'rain' | 'snow';

export interface WeatherParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length?: number;
  radius?: number;
  alpha: number;
}


export interface CharacterConfig {
  id: CharacterId;
  name: string;
  title: string;
  color: string;
  accentColor: string;
  abilityName: string;
  abilityDescription: string;
  abilityIcon: string;
  hasShield: boolean;
  scoreMultiplier: number;
  maxJumps: number;
  stats: {
    speed: number;
    jumpPower: number;
    defense: number;
  };
}

export type GameState = 'SELECT' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface Collectible {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'tire' | 'ruler' | 'key' | 'heart' | 'star' | 'black_seed';
  collected: boolean;
  pulseOffset: number;
}

export type ObstacleType = 'low' | 'high';

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  subType: 'trash' | 'cone' | 'tire_stack' | 'hanging_sign' | 'low_beam' | 'bird';
  color: string;
  passed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  category: 'hit' | 'dodge' | 'select' | 'shop' | 'seed';
  characterId?: CharacterId;
  title?: string;
  time?: number;
}

export interface ShopItem {
  id: string;
  characterId: CharacterId | 'all';
  title: string;
  description: string;
  price: number;
  unlockedQuotes: string[];
  icon: string;
  isUnlocked?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardSeed: number;
  isUnlocked?: boolean;
}


