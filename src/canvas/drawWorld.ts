import { Collectible, FloatingText, Obstacle, Particle, WeatherParticle, WeatherType } from '../types/game';

interface WorldRenderOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  groundY: number;
  gameSpeed: number;
  scrollOffset: number;
  obstacles: Obstacle[];
  collectibles: Collectible[];
  particles: Particle[];
  floatingTexts: FloatingText[];
  animFrame: number;
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  scrollOffset: number,
  timeOfDay: 'sunrise' | 'noon' | 'sunset' | 'night' = 'sunset'
) {
  // 1. SKY GRADIENT DEPENDING ON TIME OF DAY
  const skyGradient = ctx.createLinearGradient(0, 0, 0, groundY);

  if (timeOfDay === 'sunrise') {
    skyGradient.addColorStop(0, '#1e1b4b'); // Deep Blue top
    skyGradient.addColorStop(0.5, '#9d174d'); // Rose Pink
    skyGradient.addColorStop(1, '#f97316'); // Golden Horizon
  } else if (timeOfDay === 'noon') {
    skyGradient.addColorStop(0, '#0284c7'); // Bright Sky Blue
    skyGradient.addColorStop(0.6, '#38bdf8');
    skyGradient.addColorStop(1, '#bae6fd'); // Crisp horizon
  } else if (timeOfDay === 'sunset') {
    skyGradient.addColorStop(0, '#0f172a'); // Deep Slate Blue
    skyGradient.addColorStop(0.5, '#4c1d95'); // Violet
    skyGradient.addColorStop(1, '#c2410c'); // Fiery Orange
  } else {
    // NIGHT
    skyGradient.addColorStop(0, '#020617'); // Almost Black Navy
    skyGradient.addColorStop(0.7, '#0f172a');
    skyGradient.addColorStop(1, '#1e1b4b');
  }

  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  // Dynamic Fluffy Clouds moving in sky (Parallax speed 0.08)
  ctx.save();
  const cloudOffset = (scrollOffset * 0.08) % (width + 300);
  ctx.fillStyle = timeOfDay === 'night' ? 'rgba(255, 255, 255, 0.08)' : timeOfDay === 'sunset' ? 'rgba(253, 186, 116, 0.3)' : 'rgba(255, 255, 255, 0.45)';
  for (let c = -1; c < Math.ceil(width / 250) + 1; c++) {
    const cx = c * 250 - cloudOffset;
    const cy = groundY * 0.18 + (Math.sin(c * 1.5) * 20);
    ctx.beginPath();
    ctx.arc(cx + 40, cy, 25, 0, Math.PI * 2);
    ctx.arc(cx + 65, cy - 12, 30, 0, Math.PI * 2);
    ctx.arc(cx + 95, cy, 22, 0, Math.PI * 2);
    ctx.arc(cx + 70, cy + 8, 20, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Night Stars or Sun/Clouds
  if (timeOfDay === 'night' || timeOfDay === 'sunset') {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    for (let starX = 20; starX < width; starX += 90) {
      const starY = (starX * 37) % (groundY * 0.7);
      ctx.globalAlpha = 0.3 + (Math.sin(scrollOffset * 0.01 + starX) + 1) * 0.3;
      ctx.beginPath();
      ctx.arc(starX, starY, Math.random() > 0.5 ? 2 : 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Crescent Moon
    if (timeOfDay === 'night') {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(width * 0.82, groundY * 0.25, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.arc(width * 0.82 - 7, groundY * 0.25 - 4, 18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 2. PARALLAX DISTANT CITY / SCHOOL SILHOUETTES (Speed 0.15)
  ctx.save();
  const bg1Offset = (scrollOffset * 0.15) % 400;
  ctx.fillStyle = timeOfDay === 'noon' ? '#475569' : '#1e293b';
  for (let i = -1; i < Math.ceil(width / 400) + 1; i++) {
    const x = i * 400 - bg1Offset;
    // School / City silhouettes
    ctx.fillRect(x + 20, groundY - 140, 70, 140);
    ctx.fillRect(x + 100, groundY - 180, 110, 180);
    // School clock tower
    ctx.beginPath();
    ctx.moveTo(x + 155, groundY - 180);
    ctx.lineTo(x + 155, groundY - 210);
    ctx.lineTo(x + 175, groundY - 180);
    ctx.fill();

    ctx.fillRect(x + 220, groundY - 120, 80, 120);
    ctx.fillRect(x + 310, groundY - 160, 70, 160);
  }
  ctx.restore();

  // 3. PARALLAX MIDGROUND TREES & STREET LAMPS (Speed 0.4)
  ctx.save();
  const bg2Offset = (scrollOffset * 0.4) % 300;
  for (let i = -1; i < Math.ceil(width / 300) + 1; i++) {
    const x = i * 300 - bg2Offset;

    // Tree
    ctx.fillStyle = timeOfDay === 'noon' ? '#15803d' : '#166534';
    ctx.beginPath();
    ctx.arc(x + 50, groundY - 70, 30, 0, Math.PI * 2);
    ctx.arc(x + 35, groundY - 55, 25, 0, Math.PI * 2);
    ctx.arc(x + 65, groundY - 55, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 45, groundY - 50, 10, 50);

    // Street Lamp
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 200, groundY);
    ctx.lineTo(x + 200, groundY - 90);
    ctx.lineTo(x + 215, groundY - 90);
    ctx.stroke();

    // Glowing Lamp Light
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(x + 215, groundY - 86, 6, 0, Math.PI * 2);
    ctx.fill();

    // Light beam down at night
    if (timeOfDay === 'night') {
      ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
      ctx.beginPath();
      ctx.moveTo(x + 215, groundY - 86);
      ctx.lineTo(x + 185, groundY);
      ctx.lineTo(x + 245, groundY);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();

  // 4. FOREGROUND ROAD & PAVEMENT
  const roadHeight = height - groundY;
  const roadGradient = ctx.createLinearGradient(0, groundY, 0, height);
  roadGradient.addColorStop(0, '#334155');
  roadGradient.addColorStop(0.15, '#1e293b');
  roadGradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = roadGradient;
  ctx.fillRect(0, groundY, width, roadHeight);

  // Curb Line (Yellow/White hazard curb)
  const curbHeight = 8;
  const curbOffset = (scrollOffset * 1.0) % 40;
  for (let x = -40; x < width + 40; x += 40) {
    const curbX = x - curbOffset;
    ctx.fillStyle = (Math.floor((x + scrollOffset) / 40) % 2 === 0) ? '#eab308' : '#ffffff';
    ctx.fillRect(curbX, groundY, 40, curbHeight);
  }

  // Moving Road Dash Lines
  ctx.fillStyle = '#cbd5e1';
  const dashOffset = (scrollOffset * 1.0) % 60;
  const laneY = groundY + roadHeight * 0.5;
  for (let x = -60; x < width + 60; x += 60) {
    ctx.fillRect(x - dashOffset, laneY, 35, 4);
  }
}

/**
 * Draws Obstacles
 */
export function drawObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[], animFrame: number) {
  obstacles.forEach((obs) => {
    ctx.save();

    if (obs.type === 'high') {
      // HIGH OBSTACLE (Altından kaymak için!)
      if (obs.subType === 'bird') {
        // Flying Bird/Drone
        const flap = Math.sin(animFrame * 0.2) * 8;
        ctx.fillStyle = '#ef4444'; // Red body
        ctx.beginPath();
        ctx.ellipse(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5, obs.width * 0.4, obs.height * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wings
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width * 0.5, obs.y + obs.height * 0.3);
        ctx.lineTo(obs.x + obs.width * 0.1, obs.y + flap);
        ctx.lineTo(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width * 0.5, obs.y + obs.height * 0.3);
        ctx.lineTo(obs.x + obs.width * 0.9, obs.y + flap);
        ctx.lineTo(obs.x + obs.width * 0.5, obs.y + obs.height * 0.5);
        ctx.fill();

        // Glow warning
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      } else {
        // Low Overhead Hanging Sign / Beam
        ctx.fillStyle = '#dc2626'; // Caution Red
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height * 0.6);

        // Caution Stripes
        ctx.fillStyle = '#facc15';
        for (let stripeX = obs.x; stripeX < obs.x + obs.width; stripeX += 16) {
          ctx.beginPath();
          ctx.moveTo(stripeX, obs.y);
          ctx.lineTo(stripeX + 8, obs.y);
          ctx.lineTo(stripeX - 4, obs.y + obs.height * 0.6);
          ctx.lineTo(stripeX - 12, obs.y + obs.height * 0.6);
          ctx.fill();
        }

        // Hanging Chain Poles from sky
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(obs.x + 10, 0);
        ctx.lineTo(obs.x + 10, obs.y);
        ctx.moveTo(obs.x + obs.width - 10, 0);
        ctx.lineTo(obs.x + obs.width - 10, obs.y);
        ctx.stroke();

        // Text "EĞİL! / SLIDE!"
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ EĞİL! ⚠️', obs.x + obs.width * 0.5, obs.y + obs.height * 0.4);
      }
    } else {
      // LOW OBSTACLE (Üstünden zıplamak için!)
      if (obs.subType === 'trash') {
        // Trash Can
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y + 4, obs.width, obs.height - 4, 4);
        ctx.fill();

        // Lid
        ctx.fillStyle = '#334155';
        ctx.fillRect(obs.x - 3, obs.y, obs.width + 6, 7);

        // Lines
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width * 0.3, obs.y + 10);
        ctx.lineTo(obs.x + obs.width * 0.3, obs.y + obs.height - 5);
        ctx.moveTo(obs.x + obs.width * 0.7, obs.y + 10);
        ctx.lineTo(obs.x + obs.width * 0.7, obs.y + obs.height - 5);
        ctx.stroke();
      } else if (obs.subType === 'tire_stack') {
        // Tire Stack (Michelin themed)
        const count = 3;
        const tireH = obs.height / count;
        for (let i = 0; i < count; i++) {
          const ty = obs.y + i * tireH;
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(obs.x, ty, obs.width, tireH - 1, 4);
          ctx.fill();
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.ellipse(obs.x + obs.width * 0.5, ty + tireH * 0.5, obs.width * 0.35, tireH * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Traffic Cone / Spiked Barrier
        ctx.fillStyle = '#f97316'; // Orange Traffic Cone
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width * 0.5, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.lineTo(obs.x, obs.y + obs.height);
        ctx.closePath();
        ctx.fill();

        // White Stripe
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.width * 0.35, obs.y + obs.height * 0.35);
        ctx.lineTo(obs.x + obs.width * 0.65, obs.y + obs.height * 0.35);
        ctx.lineTo(obs.x + obs.width * 0.75, obs.y + obs.height * 0.65);
        ctx.lineTo(obs.x + obs.width * 0.25, obs.y + obs.height * 0.65);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.restore();
  });
}

/**
 * Draws Collectibles (Tires, Rulers, Keys, Hearts, Stars, Black Sunflower Seeds)
 */
export function drawCollectibles(ctx: CanvasRenderingContext2D, collectibles: Collectible[], animFrame: number) {
  collectibles.forEach((item) => {
    if (item.collected) return;

    ctx.save();
    const floatY = Math.sin(animFrame * 0.1 + item.pulseOffset) * 5;
    const cx = item.x + item.width * 0.5;
    const cy = item.y + item.height * 0.5 + floatY;

    // Glowing Aura
    const auraGradient = ctx.createRadialGradient(cx, cy, 2, cx, cy, item.width);
    auraGradient.addColorStop(0, item.type === 'black_seed' ? 'rgba(234, 179, 8, 0.5)' : 'rgba(250, 204, 21, 0.4)');
    auraGradient.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, item.width, 0, Math.PI * 2);
    ctx.fill();

    if (item.type === 'black_seed') {
      // SIYAH ÇEKİRDEK (Black Sunflower Seed)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((animFrame * 0.04 + item.pulseOffset) % (Math.PI * 2));

      // Golden Outer Shell
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 16, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // Black Seed Center Body
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 8.5, 13.5, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();

      // White Stripe on Seed
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-1, -8);
      ctx.quadraticCurveTo(2, 0, 3, 8);
      ctx.stroke();

      ctx.restore();
    } else if (item.type === 'tire') {
      // LASTİK (Tire) - Michelin Item
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, cy, item.width * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Rim
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(cx, cy, item.width * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx, cy, item.width * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'ruler') {
      // CETVEL (Ruler) - Baldi Item
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((animFrame * 0.05) % (Math.PI * 2));
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.roundRect(-item.width * 0.4, -item.height * 0.2, item.width * 0.8, item.height * 0.4, 2);
      ctx.fill();
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1;
      for (let tx = -item.width * 0.3; tx <= item.width * 0.3; tx += 4) {
        ctx.beginPath();
        ctx.moveTo(tx, -item.height * 0.2);
        ctx.lineTo(tx, -item.height * 0.05);
        ctx.stroke();
      }
      ctx.restore();
    } else if (item.type === 'key') {
      // ANAHTAR (Key) - Neighbor Item
      ctx.fillStyle = '#fbbf24'; // Gold
      ctx.beginPath();
      ctx.arc(cx - 5, cy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(cx - 5, cy, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Shaft & Teeth
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(cx - 2, cy - 2.5, 14, 5);
      ctx.fillRect(cx + 6, cy + 2.5, 3, 4);
      ctx.fillRect(cx + 10, cy + 2.5, 3, 5);
    } else if (item.type === 'heart') {
      // CAN KALBİ (Heart)
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 8);
      ctx.bezierCurveTo(cx - 12, cy - 2, cx - 12, cy - 12, cx, cy - 5);
      ctx.bezierCurveTo(cx, cy - 12, cx + 12, cy - 12, cx, cy + 8);
      ctx.fill();
    } else {
      // STAR POWERUP
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

/**
 * Draws Particles and Floating Score Text
 */
export function drawEffects(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  floatingTexts: FloatingText[]
) {
  // 1. PARTICLES
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // 2. FLOATING TEXTS
  floatingTexts.forEach((ft) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.font = '900 18px Outfit, sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  });
}

/**
 * Draws Comic Speech Bubble above Character
 */
export function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  alpha: number = 1
) {
  if (!text || alpha <= 0) return;

  ctx.save();
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.font = 'bold 13px Outfit, sans-serif';

  const metrics = ctx.measureText(text);
  const paddingX = 10;
  const paddingY = 6;
  const bubbleW = metrics.width + paddingX * 2;
  const bubbleH = 26;

  const bx = x - bubbleW * 0.3;
  const by = y - 30;

  // Bubble Background
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.roundRect(bx, by - bubbleH, bubbleW, bubbleH, 8);
  ctx.fill();
  ctx.stroke();

  // Little Speech Tail pointing down to head
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x + 5, by);
  ctx.lineTo(x + 14, by);
  ctx.lineTo(x + 2, by + 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + 14, by);
  ctx.lineTo(x + 2, by + 8);
  ctx.stroke();

  // Text inside bubble
  ctx.fillStyle = '#0f172a';
  ctx.textAlign = 'center';
  ctx.fillText(text, bx + bubbleW * 0.5, by - bubbleH * 0.35);

  ctx.restore();
}

/**
 * Draws Dynamic Weather Effects (Rain Streaks + Ground Splashes, Swaying Snowflakes)
 */
export function drawWeatherEffects(
  ctx: CanvasRenderingContext2D,
  weatherParticles: WeatherParticle[],
  weather: WeatherType,
  width: number,
  height: number,
  groundY: number
) {
  if (weather === 'clear' || weatherParticles.length === 0) return;

  ctx.save();

  if (weather === 'rain') {
    // Darker rain atmosphere overlay
    ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';

    weatherParticles.forEach((p) => {
      const len = p.length || 14;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 3, p.y + len);
      ctx.stroke();

      // Rain Splash Ripples near pavement
      if (p.y >= groundY - 10 && p.y <= groundY + 30) {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(p.x, groundY + 5, 6, 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  } else if (weather === 'snow') {
    // Cool winter atmosphere overlay
    ctx.fillStyle = 'rgba(224, 242, 254, 0.08)';
    ctx.fillRect(0, 0, width, height);

    weatherParticles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 4;

      const r = p.radius || 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Extra detail for larger snowflakes
      if (r > 3.5) {
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x - r * 1.3, p.y);
        ctx.lineTo(p.x + r * 1.3, p.y);
        ctx.moveTo(p.x, p.y - r * 1.3);
        ctx.lineTo(p.x, p.y + r * 1.3);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  ctx.restore();
}

