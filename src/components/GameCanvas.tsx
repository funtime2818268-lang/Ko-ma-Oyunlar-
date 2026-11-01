import React, { useEffect, useRef } from 'react';
import { drawCharacter } from '../canvas/drawCharacters';
import { drawBackground, drawCollectibles, drawEffects, drawObstacles, drawSpeechBubble, drawWeatherEffects } from '../canvas/drawWorld';
import { Achievement, CharacterConfig, Collectible, FloatingText, Obstacle, Particle, TimeOfDay, WeatherParticle, WeatherType } from '../types/game';
import { soundManager } from '../utils/audio';
import { checkCollectiblePickup, checkObstacleCollision, PlayerPhysicsState, updatePlayerPhysics } from '../utils/physics';

import { checkAchievements } from '../utils/achievements';
import { addBlackSeeds, getBlackSeeds } from '../utils/storage';

interface GameCanvasProps {
  character: CharacterConfig;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
  isPaused: boolean;
  isGameOver: boolean;
  onUpdateScore: (scoreUpdater: (prev: number) => number) => void;
  onUpdateLives: (livesUpdater: (prev: number) => number) => void;
  onUpdateBlackSeeds: (seedsUpdater: (prev: number) => number) => void;
  onGameOver: () => void;
  onUpdateShield: (active: boolean) => void;
  onUpdateJumpsRemaining: (jumps: number) => void;
  onToast: (text: string, title?: string, charId?: any, category?: 'hit' | 'dodge' | 'select' | 'shop' | 'seed') => void;
  onUnlockAchievement: (achievement: Achievement) => void;
  hasShield: boolean;
  // Trigger refs for external HUD touch buttons
  jumpTriggerRef: React.MutableRefObject<(() => void) | null>;
  slideTriggerRef: React.MutableRefObject<(() => void) | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  character,
  timeOfDay,
  weather,
  isPaused,
  isGameOver,
  onUpdateScore,
  onUpdateLives,
  onUpdateBlackSeeds,
  onGameOver,
  onUpdateShield,
  onUpdateJumpsRemaining,
  onToast,
  onUnlockAchievement,
  hasShield,
  jumpTriggerRef,
  slideTriggerRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game Engine State Refs (persisted across renders without re-triggering React cycle)
  const gameStateRef = useRef<{
    gameSpeed: number;
    scrollOffset: number;
    score: number;
    collectiblesCount: number;
    invulnerableTimer: number;
    hasActiveShield: boolean;
    cameraShakeTimer: number;
    cameraShakeIntensity: number;
    obstacles: Obstacle[];
    collectibles: Collectible[];
    particles: Particle[];
    weatherParticles: WeatherParticle[];
    floatingTexts: FloatingText[];
    speechBubbleText: string | null;
    speechBubbleTimer: number;
    spawnTimer: number;
    collectibleTimer: number;
    lastTime: number;
    animFrame: number;
    player: PlayerPhysicsState;
  }>({
    gameSpeed: 400,
    scrollOffset: 0,
    score: 0,
    collectiblesCount: 0,
    invulnerableTimer: 0,
    hasActiveShield: character.hasShield,
    cameraShakeTimer: 0,
    cameraShakeIntensity: 0,
    obstacles: [],
    collectibles: [],
    particles: [],
    weatherParticles: [],
    floatingTexts: [],
    speechBubbleText: null,
    speechBubbleTimer: 0,
    spawnTimer: 0,
    collectibleTimer: 0,
    lastTime: 0,
    animFrame: 0,
    player: {
      x: 120,
      y: 0, // set in resize
      offsetY: 0,
      vy: 0,
      width: 70,
      height: 100,
      state: 'run',
      jumpsRemaining: character.maxJumps,
      maxJumps: character.maxJumps,
      isGrounded: true,
      slideTimer: 0,
    },
  });

  // Touch Swipe coordinates
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const triggerVoiceLine = (action: 'jump' | 'slide' | 'collect' | 'shield' | 'hit' | 'gameover') => {
    const st = gameStateRef.current;
    const text = soundManager.speakVoice(character.id, action);
    if (text) {
      st.speechBubbleText = text;
      st.speechBubbleTimer = 1.8;
    }
  };

  /**
   * Triggers screen/camera shake effect on obstacle collisions or big jumps
   */
  const triggerCameraShake = (duration: number = 0.25, intensity: number = 8) => {
    const st = gameStateRef.current;
    st.cameraShakeTimer = duration;
    st.cameraShakeIntensity = intensity;
  };

  // 1. Core Action Handlers (Jump & Slide)
  const performJump = () => {
    const st = gameStateRef.current;
    if (isPaused || isGameOver) return;

    if (st.player.jumpsRemaining > 0) {
      if (st.player.jumpsRemaining === st.player.maxJumps) {
        soundManager.playJump();
      } else {
        soundManager.playDoubleJump();

        // Spawn Double Jump Particle Swoosh for Neighbor!
        for (let i = 0; i < 12; i++) {
          st.particles.push({
            x: st.player.x + (Math.random() * 30 - 15),
            y: st.player.y - st.player.offsetY,
            vx: (Math.random() - 0.5) * 200,
            vy: Math.random() * 100 + 50,
            radius: Math.random() * 5 + 3,
            color: '#facc15',
            alpha: 1,
            decay: 2.5,
          });
        }
      }

      triggerVoiceLine('jump');

      st.player.vy = 850; // Initial jump velocity
      st.player.offsetY += 5;
      st.player.isGrounded = false;
      st.player.state = 'jump';
      st.player.jumpsRemaining -= 1;
      onUpdateJumpsRemaining(st.player.jumpsRemaining);
    }
  };

  const performSlide = () => {
    const st = gameStateRef.current;
    if (isPaused || isGameOver) return;

    soundManager.playSlide();
    triggerVoiceLine('slide');

    st.player.state = 'slide';
    st.player.slideTimer = 0.65; // Slide duration in seconds

    // Dust particles on ground
    for (let i = 0; i < 8; i++) {
      st.particles.push({
        x: st.player.x,
        y: st.player.y - 5,
        vx: -Math.random() * 150 - 50,
        vy: -Math.random() * 80,
        radius: Math.random() * 4 + 2,
        color: '#94a3b8',
        alpha: 0.8,
        decay: 2.0,
      });
    }
  };

  // Assign triggers for HUD virtual buttons
  useEffect(() => {
    jumpTriggerRef.current = performJump;
    slideTriggerRef.current = performSlide;
  }, []);

  // Reset Engine on Character or Restart Change
  useEffect(() => {
    const canvas = canvasRef.current;
    const groundY = canvas ? canvas.height * 0.76 : 350;

    // Initialize Weather Particles
    const initialWeatherParticles: WeatherParticle[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;
    const count = weather === 'rain' ? 70 : weather === 'snow' ? 55 : 0;
    for (let i = 0; i < count; i++) {
      initialWeatherParticles.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        vx: weather === 'rain' ? -40 : (Math.random() - 0.5) * 30,
        vy: weather === 'rain' ? 650 + Math.random() * 200 : 80 + Math.random() * 50,
        length: Math.random() * 8 + 12,
        radius: Math.random() * 2.5 + 1.5,
        alpha: weather === 'rain' ? Math.random() * 0.4 + 0.4 : Math.random() * 0.5 + 0.4,
      });
    }

    gameStateRef.current = {
      gameSpeed: 400,
      scrollOffset: 0,
      score: 0,
      collectiblesCount: 0,
      invulnerableTimer: 0,
      hasActiveShield: character.hasShield,
      cameraShakeTimer: 0,
      cameraShakeIntensity: 0,
      obstacles: [],
      collectibles: [],
      particles: [],
      weatherParticles: initialWeatherParticles,
      floatingTexts: [],
      speechBubbleText: null,
      speechBubbleTimer: 0,
      spawnTimer: 1.5,
      collectibleTimer: 0.8,
      lastTime: performance.now(),
      animFrame: 0,
      player: {
        x: 140,
        y: groundY,
        offsetY: 0,
        vy: 0,
        width: 70,
        height: 100,
        state: 'run',
        jumpsRemaining: character.maxJumps,
        maxJumps: character.maxJumps,
        isGrounded: true,
        slideTimer: 0,
      },
    };

    onUpdateShield(character.hasShield);
    onUpdateJumpsRemaining(character.maxJumps);
  }, [character, weather]);

  // 2. Keyboard & Touch Gesture Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        performJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        performSlide();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length > 0) {
        const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
        const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;

        // If Y motion is greater than X motion and exceeds threshold
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 30) {
          if (deltaY < 0) {
            // Swipe Up = Jump
            performJump();
          } else {
            // Swipe Down = Slide
            performSlide();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPaused, isGameOver, character]);

  // 3. Game Loop & Canvas Lifecycle
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);

      const groundY = window.innerHeight * 0.78;
      gameStateRef.current.player.y = groundY;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // MAIN GAME ENGINE LOOP
    const loop = (time: number) => {
      const st = gameStateRef.current;
      const rawDt = (time - (st.lastTime || time)) / 1000;
      st.lastTime = time;
      const dt = Math.min(rawDt, 0.05); // Clamp frame delta time for 60fps physics stability

      const width = window.innerWidth;
      const height = window.innerHeight;
      const groundY = height * 0.78;
      st.player.y = groundY;

      if (!isPaused && !isGameOver) {
        st.animFrame++;

        // A. Speed Ramp (Gradually increase runner speed)
        st.gameSpeed = Math.min(750, st.gameSpeed + dt * 4);
        st.scrollOffset += st.gameSpeed * dt;

        // B. Update Distance Score
        const addedScore = Math.round((st.gameSpeed * dt * 0.1) * character.scoreMultiplier);
        st.score += addedScore;
        onUpdateScore((prev) => prev + addedScore);

        // Check Achievements periodically
        if (st.animFrame % 30 === 0) {
          checkAchievements(
            {
              score: st.score,
              characterId: character.id,
              timeOfDay,
              totalBlackSeeds: getBlackSeeds(),
            },
            (ach) => onUnlockAchievement(ach)
          );
        }

        // C. Update Player Physics
        st.player = updatePlayerPhysics(st.player, dt);
        if (st.player.isGrounded && st.player.jumpsRemaining !== character.maxJumps) {
          st.player.jumpsRemaining = character.maxJumps;
          onUpdateJumpsRemaining(character.maxJumps);
        }

        // D. Update Invulnerability Timer
        if (st.invulnerableTimer > 0) {
          st.invulnerableTimer -= dt;
        }

        // E. Spawn Obstacles (Alternating High vs Low)
        st.spawnTimer -= dt;
        if (st.spawnTimer <= 0) {
          st.spawnTimer = Math.max(1.1, 2.5 - (st.gameSpeed - 380) / 300) + Math.random() * 0.6;

          const isHigh = Math.random() > 0.5;
          if (isHigh) {
            // High obstacle (EĞİL / SLIDE UNDER)
            const obsHeight = 45;
            const obsY = groundY - 110; // Overhead height
            st.obstacles.push({
              x: width + 50,
              y: obsY,
              width: 80,
              height: obsHeight,
              type: 'high',
              subType: Math.random() > 0.5 ? 'bird' : 'hanging_sign',
              color: '#ef4444',
              passed: false,
            });
          } else {
            // Low obstacle (ZIPLA / JUMP OVER)
            const obsHeight = 50;
            const obsY = groundY - obsHeight;
            const sub = Math.random() > 0.6 ? 'trash' : Math.random() > 0.3 ? 'tire_stack' : 'cone';
            st.obstacles.push({
              x: width + 50,
              y: obsY,
              width: sub === 'trash' ? 45 : 55,
              height: obsHeight,
              type: 'low',
              subType: sub,
              color: '#f97316',
              passed: false,
            });
          }
        }

        // Move Obstacles
        st.obstacles.forEach((obs) => {
          obs.x -= st.gameSpeed * dt;
          if (!obs.passed && obs.x + obs.width < st.player.x) {
            obs.passed = true;
            // Light Camera Shake on successfully jumping over or sliding under obstacle!
            triggerCameraShake(0.18, 5);
          }
        });
        st.obstacles = st.obstacles.filter((obs) => obs.x + obs.width > -50);

        // F. Spawn Collectibles
        st.collectibleTimer -= dt;
        if (st.collectibleTimer <= 0) {
          st.collectibleTimer = Math.random() * 1.2 + 0.8;
          const collectibleTypes: Array<'tire' | 'ruler' | 'key' | 'heart' | 'black_seed'> = ['tire', 'ruler', 'key', 'black_seed', 'black_seed'];
          if (Math.random() < 0.15) collectibleTypes.push('heart');

          const chosenType = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)];
          const itemY = Math.random() > 0.5 ? groundY - 60 : groundY - 130;

          st.collectibles.push({
            x: width + 40,
            y: itemY,
            width: 32,
            height: 32,
            type: chosenType,
            collected: false,
            pulseOffset: Math.random() * 10,
          });
        }

        // Move Collectibles
        st.collectibles.forEach((c) => {
          c.x -= st.gameSpeed * dt;
        });
        st.collectibles = st.collectibles.filter((c) => c.x + c.width > -40);

        // G. Collision Check with Obstacles
        if (st.invulnerableTimer <= 0) {
          for (const obs of st.obstacles) {
            if (checkObstacleCollision({ ...st.player, groundY }, obs)) {
              if (st.hasActiveShield) {
                // BIBENDUM SHIELD ABSORBS HIT!
                soundManager.playShieldBreak();
                triggerVoiceLine('shield');
                triggerCameraShake(0.3, 10);
                onToast("Kalkanın amına koydular ama yemedik!", "KALKAN ABSORBE ETTİ", character.id, "hit");
                st.hasActiveShield = false;
                onUpdateShield(false);
                st.invulnerableTimer = 1.2;

                // Crystal particles burst
                for (let i = 0; i < 20; i++) {
                  st.particles.push({
                    x: st.player.x,
                    y: groundY - st.player.offsetY - 40,
                    vx: (Math.random() - 0.5) * 400,
                    vy: (Math.random() - 0.5) * 400,
                    radius: Math.random() * 5 + 3,
                    color: '#38bdf8',
                    alpha: 1,
                    decay: 1.5,
                  });
                }

                st.floatingTexts.push({
                  id: Math.random().toString(),
                  x: st.player.x,
                  y: groundY - st.player.offsetY - 70,
                  text: '🛡️ KALKAN KORUDU!',
                  color: '#38bdf8',
                  alpha: 1,
                  vy: -60,
                });

                break;
              } else {
                // TAKES HIT & LOSES LIFE
                soundManager.playHit();
                triggerVoiceLine('hit');
                triggerCameraShake(0.45, 18);
                onToast("Has siktir çarptık amk!", "KAZA YAPILDI", character.id, "hit");
                st.invulnerableTimer = 1.5;

                onUpdateLives((prev) => {
                  const next = prev - 1;
                  if (next <= 0) {
                    soundManager.playGameOver();
                    triggerVoiceLine('gameover');
                    onToast("Vurgun yedik amk, helvamızı kavurun!", "GAME OVER", character.id, "hit");
                    onGameOver();
                  }
                  return next;
                });

                // Red Flash text
                st.floatingTexts.push({
                  id: Math.random().toString(),
                  x: st.player.x,
                  y: groundY - st.player.offsetY - 70,
                  text: '💥 HASAR!',
                  color: '#ef4444',
                  alpha: 1,
                  vy: -60,
                });

                break;
              }
            }
          }
        }

        // H. Check Collectibles Pickup
        st.collectibles.forEach((item) => {
          if (!item.collected && checkCollectiblePickup({ ...st.player, groundY }, item)) {
            item.collected = true;
            soundManager.playCollect(item.type);
            triggerVoiceLine('collect');
            st.collectiblesCount += 1;

            let pts = 50 * character.scoreMultiplier;
            let label = `+${pts}`;

            if (item.type === 'black_seed') {
              const totalSeeds = addBlackSeeds(1);
              onUpdateBlackSeeds(() => totalSeeds);
              label = '🌻 +1 SİYAH ÇEKİRDEK!';
              onToast("Siyah çekirdeği kaptık amk, mağazaya yatır!", "ÇEKİRDEK TOPLANDI", character.id, "seed");
            } else if (item.type === 'heart') {
              onUpdateLives((prev) => Math.min(3, prev + 1));
              label = '❤️ +1 CAN!';
            }

            st.score += pts;
            onUpdateScore((prev) => prev + pts);

            // Floating pickup text
            st.floatingTexts.push({
              id: Math.random().toString(),
              x: item.x,
              y: item.y,
              text: label,
              color: '#facc15',
              alpha: 1,
              vy: -70,
            });

            // Sparkle Particles
            for (let i = 0; i < 10; i++) {
              st.particles.push({
                x: item.x,
                y: item.y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                radius: Math.random() * 4 + 2,
                color: item.type === 'black_seed' ? '#eab308' : '#fde047',
                alpha: 1,
                decay: 2.0,
              });
            }
          }
        });

        // I. Update Particles & Floating Texts
        st.particles.forEach((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha -= p.decay * dt;
        });
        st.particles = st.particles.filter((p) => p.alpha > 0);

        // Slide Friction Sparks when sliding on pavement
        if (st.player.state === 'slide' && st.animFrame % 2 === 0) {
          st.particles.push({
            x: st.player.x - 10 + Math.random() * 30,
            y: groundY - 4,
            vx: -st.gameSpeed * 0.3 + (Math.random() - 0.5) * 80,
            vy: -Math.random() * 60 - 20,
            radius: Math.random() * 3.5 + 1.5,
            color: Math.random() > 0.4 ? '#f59e0b' : '#94a3b8',
            alpha: 0.9,
            decay: 3.0,
          });
        }

        // Update Weather Particles (Rain & Snow)
        st.weatherParticles.forEach((wp) => {
          if (weather === 'rain') {
            wp.y += wp.vy * dt;
            wp.x += (wp.vx || -40) * dt;
            if (wp.y > groundY + 30 || wp.x < -40) {
              wp.y = -20;
              wp.x = Math.random() * (width + 150) - 50;
            }
          } else if (weather === 'snow') {
            wp.y += wp.vy * dt;
            wp.x += Math.sin(st.animFrame * 0.05 + wp.y * 0.01) * 25 * dt;
            if (wp.y > height + 10) {
              wp.y = -10;
              wp.x = Math.random() * width;
            }
          }
        });

        st.floatingTexts.forEach((ft) => {
          ft.y += ft.vy * dt;
          ft.alpha -= 1.2 * dt;
        });
        st.floatingTexts = st.floatingTexts.filter((ft) => ft.alpha > 0);

        // Update Camera Shake Timer
        if (st.cameraShakeTimer > 0) {
          st.cameraShakeTimer -= dt;
        }

        // Update Speech Bubble Timer
        if (st.speechBubbleTimer > 0) {
          st.speechBubbleTimer -= dt;
          if (st.speechBubbleTimer <= 0) {
            st.speechBubbleText = null;
          }
        }
      }

      // RENDER GAME CANVAS
      ctx.clearRect(0, 0, width, height);

      // Camera Shake Transform Context
      ctx.save();
      if (st.cameraShakeTimer > 0) {
        const factor = Math.min(1, st.cameraShakeTimer / 0.1);
        const shakeX = (Math.random() - 0.5) * 2 * st.cameraShakeIntensity * factor;
        const shakeY = (Math.random() - 0.5) * 2 * st.cameraShakeIntensity * factor;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Draw Parallax Background & Pavement with TimeOfDay
      drawBackground(ctx, width, height, groundY, st.scrollOffset, timeOfDay);

      // 1.5 Draw Dynamic Weather Effects (Rain & Snow)
      drawWeatherEffects(ctx, st.weatherParticles, weather, width, height, groundY);

      // 2. Draw Collectibles & Obstacles
      drawCollectibles(ctx, st.collectibles, st.animFrame);
      drawObstacles(ctx, st.obstacles, st.animFrame);

      // 3. Draw Player Character
      drawCharacter({
        ctx,
        id: character.id,
        x: st.player.x,
        y: groundY - st.player.offsetY,
        width: st.player.width,
        height: st.player.height,
        state: st.player.state,
        animFrame: st.animFrame,
        hasActiveShield: st.hasActiveShield,
        isInvulnerable: st.invulnerableTimer > 0,
      });

      // 4. Draw Comic Speech Bubble above Character
      if (st.speechBubbleText) {
        drawSpeechBubble(
          ctx,
          st.player.x,
          groundY - st.player.offsetY - st.player.height,
          st.speechBubbleText,
          st.speechBubbleTimer
        );
      }

      // 5. Draw FX (Particles & Floating Score Texts)
      drawEffects(ctx, st.particles, st.floatingTexts);

      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPaused, isGameOver, character]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full block bg-slate-950 pointer-events-auto"
    />
  );
};
