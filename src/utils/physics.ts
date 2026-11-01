import { Collectible, Obstacle } from '../types/game';

export interface PlayerPhysicsState {
  x: number;
  y: number; // Ground Y reference
  offsetY: number; // Vertical distance off ground (0 when on ground, positive when in air)
  vy: number;
  width: number;
  height: number;
  state: 'run' | 'jump' | 'slide';
  jumpsRemaining: number;
  maxJumps: number;
  isGrounded: boolean;
  slideTimer: number;
}

export function updatePlayerPhysics(
  player: PlayerPhysicsState,
  dt: number,
  gravity: number = 2200
): PlayerPhysicsState {
  const updated = { ...player };

  // 1. Handle Slide Timer
  if (updated.state === 'slide') {
    updated.slideTimer -= dt;
    if (updated.slideTimer <= 0) {
      updated.state = updated.isGrounded ? 'run' : 'jump';
      updated.slideTimer = 0;
    }
  }

  // 2. Handle Vertical Jump Movement
  if (!updated.isGrounded) {
    updated.offsetY += updated.vy * dt;
    updated.vy -= gravity * dt;

    if (updated.offsetY <= 0) {
      updated.offsetY = 0;
      updated.vy = 0;
      updated.isGrounded = true;
      updated.jumpsRemaining = updated.maxJumps;
      if (updated.state === 'jump') {
        updated.state = 'run';
      }
    }
  }

  return updated;
}

/**
 * Checks Bounding Box Collision between Player and Obstacle
 */
export function checkObstacleCollision(
  player: { x: number; groundY: number; offsetY: number; width: number; height: number; state: 'run' | 'jump' | 'slide' },
  obs: Obstacle
): boolean {
  // Compute player bounding box
  const playerW = player.width * (player.state === 'slide' ? 1.2 : 0.7);
  const playerH = player.height * (player.state === 'slide' ? 0.45 : 0.85);

  const playerLeft = player.x - playerW * 0.5;
  const playerRight = player.x + playerW * 0.5;
  const playerBottom = player.groundY - player.offsetY;
  const playerTop = playerBottom - playerH;

  const obsLeft = obs.x;
  const obsRight = obs.x + obs.width;
  const obsTop = obs.y;
  const obsBottom = obs.y + obs.height;

  // AABB Collision Detection
  const intersectsX = playerRight > obsLeft + 5 && playerLeft < obsRight - 5;
  const intersectsY = playerBottom > obsTop + 5 && playerTop < obsBottom - 5;

  return intersectsX && intersectsY;
}

/**
 * Checks Collectible Pickup
 */
export function checkCollectiblePickup(
  player: { x: number; groundY: number; offsetY: number; width: number; height: number },
  item: Collectible
): boolean {
  if (item.collected) return false;

  const playerCx = player.x;
  const playerCy = player.groundY - player.offsetY - player.height * 0.5;

  const itemCx = item.x + item.width * 0.5;
  const itemCy = item.y + item.height * 0.5;

  const dx = playerCx - itemCx;
  const dy = playerCy - itemCy;
  const distSq = dx * dx + dy * dy;

  const pickupRadius = Math.max(player.width, player.height) * 0.55 + item.width * 0.5;

  return distSq < pickupRadius * pickupRadius;
}
