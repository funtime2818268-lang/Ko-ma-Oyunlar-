import { CharacterId } from '../types/game';

interface DrawCharacterOptions {
  ctx: CanvasRenderingContext2D;
  id: CharacterId;
  x: number; // Bottom center or top-left depending on reference, let's use bottom-center anchor (ground X, Y)
  y: number; // Ground Y position
  width: number;
  height: number;
  state: 'run' | 'jump' | 'slide' | 'idle';
  animFrame: number;
  hasActiveShield?: boolean;
  isInvulnerable?: boolean;
  scale?: number;
}

/**
 * Draws character Bibendum (Michelin Man) with high detail vector canvas instructions
 */
export function drawBibendum({
  ctx,
  x,
  y,
  width,
  height,
  state,
  animFrame,
  hasActiveShield = false,
  isInvulnerable = false,
  scale = 1,
}: DrawCharacterOptions) {
  ctx.save();

  if (isInvulnerable && Math.floor(animFrame * 10) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  // Draw Shield Aura if active
  if (hasActiveShield) {
    ctx.save();
    const shieldRadius = Math.max(width, height) * 0.65;
    const pulse = Math.sin(animFrame * 0.1) * 4;
    const gradient = ctx.createRadialGradient(x, y - height * 0.5, shieldRadius * 0.4, x, y - height * 0.5, shieldRadius + pulse);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
    gradient.addColorStop(0.7, 'rgba(14, 165, 233, 0.4)');
    gradient.addColorStop(1, 'rgba(3, 105, 161, 0.8)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y - height * 0.5, shieldRadius + pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 4]);
    ctx.lineDashOffset = -animFrame * 2;
    ctx.stroke();
    ctx.restore();
  }

  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Position offsets based on state
  const runBob = state === 'run' ? Math.sin(animFrame * 0.3) * 3.5 : 0;
  let headY = -height * 0.82 + runBob;
  let torsoY = -height * 0.52 + runBob;
  const bodyWidth = width * 0.75;
  const legSwing = state === 'run' ? Math.sin(animFrame * 0.25) * 22 : 0;
  const armSwing = state === 'run' ? Math.cos(animFrame * 0.25) * 20 : 0;

  if (state === 'slide') {
    // Sliding pose: Flattened horizontally
    ctx.rotate(Math.PI / 6); // Slanted back
    headY = -height * 0.45;
    torsoY = -height * 0.3;
  } else if (state === 'jump') {
    torsoY -= 5;
    headY -= 8;
  }

  // 1. LEGS (Layered white tire rings)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;

  // Left Leg
  ctx.save();
  ctx.translate(-bodyWidth * 0.22, torsoY + 15);
  ctx.rotate((legSwing * Math.PI) / 180);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, i * 11, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Foot / Shoe
  ctx.beginPath();
  ctx.roundRect(-10, 32, 18, 9, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right Leg
  ctx.save();
  ctx.translate(bodyWidth * 0.22, torsoY + 15);
  ctx.rotate((-legSwing * Math.PI) / 180);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, i * 11, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Foot / Shoe
  ctx.beginPath();
  ctx.roundRect(-8, 32, 18, 9, 4);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 2. TORSO (Stacked 4 puffy white tire rolls)
  const rollHeights = [14, 13, 12, 11];
  const rollWidths = [bodyWidth * 0.45, bodyWidth * 0.42, bodyWidth * 0.38, bodyWidth * 0.33];
  let currY = torsoY + 15;

  for (let i = 0; i < 4; i++) {
    currY -= rollHeights[i] * 0.75;
    ctx.beginPath();
    ctx.ellipse(0, currY, rollWidths[i], rollHeights[i] * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    // Inner shadow ring for 3D puffy look
    ctx.beginPath();
    ctx.ellipse(0, currY + 2, rollWidths[i] * 0.9, rollHeights[i] * 0.4, 0, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.lineWidth = 2;
  }

  // 3. DIAGONAL BLUE MICHELIN SASH (Across Chest)
  ctx.save();
  ctx.beginPath();
  ctx.rotate(-Math.PI / 10);
  ctx.roundRect(-rollWidths[0] * 1.05, currY - 2, rollWidths[0] * 2.1, 11, 3);
  ctx.fillStyle = '#1e3a8a'; // Dark Navy Blue
  ctx.fill();
  ctx.strokeStyle = '#facc15'; // Yellow border
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Text "MICHELIN" sash detail
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 7px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MICHELIN', 0, currY + 6);
  ctx.restore();

  // 4. ARMS (White puffy rings swinging)
  // Left Arm
  ctx.save();
  ctx.translate(-bodyWidth * 0.4, currY - 5);
  ctx.rotate((-armSwing * Math.PI) / 180);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(-i * 4, i * 9, 8, 6, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();
  }
  ctx.restore();

  // Right Arm (Holding Black Tire detail!)
  ctx.save();
  ctx.translate(bodyWidth * 0.4, currY - 5);
  ctx.rotate((armSwing * Math.PI) / 180);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(i * 4, i * 9, 8, 6, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();
  }
  // Black Tire Accessory in hand
  ctx.beginPath();
  ctx.arc(14, 22, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#1e293b';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(14, 22, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#64748b';
  ctx.fill();
  ctx.restore();

  // 5. HEAD (Round white puffy head with smile)
  const headRadius = width * 0.26;
  ctx.beginPath();
  ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Chin puffy ring
  ctx.beginPath();
  ctx.ellipse(0, headY + headRadius * 0.75, headRadius * 0.9, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.stroke();

  // Eyes (Friendly black eyes with white glare)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-headRadius * 0.35, headY - 3, 3.5, 0, Math.PI * 2);
  ctx.arc(headRadius * 0.35, headY - 3, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-headRadius * 0.35 + 1, headY - 4, 1.2, 0, Math.PI * 2);
  ctx.arc(headRadius * 0.35 + 1, headY - 4, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Cute Nose
  ctx.beginPath();
  ctx.arc(0, headY, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#94a3b8';
  ctx.fill();

  // Happy Smile
  ctx.beginPath();
  ctx.arc(0, headY + 2, headRadius * 0.45, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws Baldi with high detail vector canvas instructions
 */
export function drawBaldi({
  ctx,
  x,
  y,
  width,
  height,
  state,
  animFrame,
  isInvulnerable = false,
  scale = 1,
}: DrawCharacterOptions) {
  ctx.save();

  if (isInvulnerable && Math.floor(animFrame * 10) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const legSwing = state === 'run' ? Math.sin(animFrame * 0.28) * 26 : 0;
  const armSwing = state === 'run' ? Math.cos(animFrame * 0.28) * 25 : 0;
  const runBob = state === 'run' ? Math.sin(animFrame * 0.3) * 4 : 0;

  let headY = -height * 0.85 + runBob;
  let torsoY = -height * 0.55 + runBob;

  if (state === 'slide') {
    ctx.rotate(Math.PI / 5);
    headY = -height * 0.5;
    torsoY = -height * 0.35;
  }

  // 1. SKINNY LONG BLUE LEGS
  ctx.strokeStyle = '#1d4ed8'; // Bright dark blue pants
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  // Left Leg
  ctx.save();
  ctx.translate(-7, torsoY + 25);
  ctx.rotate((legSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-2, height * 0.35);
  ctx.stroke();

  // Brown Shoe
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.roundRect(-7, height * 0.35 - 2, 15, 7, 3);
  ctx.fill();
  ctx.restore();

  // Right Leg
  ctx.save();
  ctx.translate(7, torsoY + 25);
  ctx.rotate((-legSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(2, height * 0.35);
  ctx.stroke();

  // Brown Shoe
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.roundRect(-5, height * 0.35 - 2, 15, 7, 3);
  ctx.fill();
  ctx.restore();

  // 2. BRIGHT GREEN LONG-SLEEVE TUNIC / SHIRT
  ctx.fillStyle = '#22c55e'; // Bright Green
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.roundRect(-width * 0.25, torsoY - 20, width * 0.5, height * 0.38, 6);
  ctx.fill();
  ctx.stroke();

  // 3. ARMS & RULER (Baldi holds a red ruler!)
  ctx.strokeStyle = '#16a34a'; // Sleeve color
  ctx.lineWidth = 5;

  // Left Arm
  ctx.save();
  ctx.translate(-width * 0.24, torsoY - 12);
  ctx.rotate((-armSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-12, 28);
  ctx.stroke();

  // Pale Hand
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(-13, 30, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Arm (Holding Red Ruler)
  ctx.save();
  ctx.translate(width * 0.24, torsoY - 12);
  ctx.rotate((armSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(12, 25);
  ctx.stroke();

  // Hand
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(13, 27, 4, 0, Math.PI * 2);
  ctx.fill();

  // Red Ruler Icon in hand
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.roundRect(10, 15, 5, 26, 1);
  ctx.fill();

  // Ruler tick marks
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  for (let t = 18; t < 38; t += 4) {
    ctx.beginPath();
    ctx.moveTo(10, t);
    ctx.lineTo(13, t);
    ctx.stroke();
  }
  ctx.restore();

  // 4. BALD ROUND HEAD
  const headRadius = width * 0.24;
  ctx.fillStyle = '#fde047'; // Skin tone light yellowish-tan like 3D model
  ctx.beginPath();
  ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Single Thin Brown Hair Strand at Top Left! (Signature Baldi feature!)
  ctx.beginPath();
  ctx.moveTo(-2, headY - headRadius + 1);
  ctx.quadraticCurveTo(-10, headY - headRadius - 12, -4, headY - headRadius - 16);
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Big Round Eyes with Dark Pupils
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-7, headY - 3, 5, 0, Math.PI * 2);
  ctx.arc(7, headY - 3, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(-7, headY - 3, 2.2, 0, Math.PI * 2);
  ctx.arc(7, headY - 3, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Cute Nose
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.ellipse(0, headY + 2, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Red Line Lips (Wide bright red mouth line)
  ctx.beginPath();
  ctx.moveTo(-10, headY + 9);
  ctx.quadraticCurveTo(0, headY + 14, 10, headY + 9);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws Hello Neighbor (Komşu) with high detail vector canvas instructions
 */
export function drawNeighbor({
  ctx,
  x,
  y,
  width,
  height,
  state,
  animFrame,
  isInvulnerable = false,
  scale = 1,
}: DrawCharacterOptions) {
  ctx.save();

  if (isInvulnerable && Math.floor(animFrame * 10) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  ctx.translate(x, y);
  ctx.scale(scale, scale);

  const legSwing = state === 'run' ? Math.sin(animFrame * 0.3) * 24 : 0;
  const armSwing = state === 'run' ? Math.cos(animFrame * 0.3) * 22 : 0;
  const runBob = state === 'run' ? Math.sin(animFrame * 0.32) * 3.8 : 0;

  let headY = -height * 0.85 + runBob;
  let torsoY = -height * 0.52 + runBob;

  if (state === 'slide') {
    ctx.rotate(Math.PI / 5);
    headY = -height * 0.48;
    torsoY = -height * 0.32;
  }

  // 1. VIBRANT ORANGE PANTS & SNEAKERS
  ctx.strokeStyle = '#ea580c'; // Bright Orange Pants
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';

  // Left Leg
  ctx.save();
  ctx.translate(-8, torsoY + 20);
  ctx.rotate((legSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-3, height * 0.32);
  ctx.stroke();

  // Sneaker (Black with blue tip)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-9, height * 0.32 - 2, 16, 8, 3);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(5, height * 0.32 + 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Right Leg
  ctx.save();
  ctx.translate(8, torsoY + 20);
  ctx.rotate((-legSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(3, height * 0.32);
  ctx.stroke();

  // Sneaker
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(-7, height * 0.32 - 2, 16, 8, 3);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(7, height * 0.32 + 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. YELLOW SHIRT + BLUE ARGYLE SWEATER VEST
  const vestW = width * 0.52;
  const vestH = height * 0.35;

  // Yellow Shirt Sleeves & Collar background
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.roundRect(-vestW * 0.55, torsoY - 20, vestW * 1.1, vestH + 4, 6);
  ctx.fill();

  // Blue Sweater Vest
  ctx.fillStyle = '#1e40af'; // Medium-dark blue sweater vest
  ctx.beginPath();
  ctx.roundRect(-vestW * 0.5, torsoY - 18, vestW, vestH, 4);
  ctx.fill();

  // ARGYLE DIAMOND PATTERN ON VEST!
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = '#60a5fa'; // Light blue argyle lines
  ctx.lineWidth = 1.2;

  // Diamond Grid Lines
  for (let dx = -30; dx <= 30; dx += 14) {
    ctx.beginPath();
    ctx.moveTo(dx - 15, torsoY - 20);
    ctx.lineTo(dx + 25, torsoY + 30);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(dx + 25, torsoY - 20);
    ctx.lineTo(dx - 15, torsoY + 30);
    ctx.stroke();
  }
  ctx.restore();

  // Yellow Shirt V-Neck Collar
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(-6, torsoY - 18);
  ctx.lineTo(0, torsoY - 6);
  ctx.lineTo(6, torsoY - 18);
  ctx.fill();

  // 3. ARMS WITH BLACK GLOVES
  ctx.strokeStyle = '#facc15'; // Yellow sleeve upper
  ctx.lineWidth = 5;

  // Left Arm
  ctx.save();
  ctx.translate(-vestW * 0.5, torsoY - 10);
  ctx.rotate((-armSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-10, 20);
  ctx.stroke();

  // Black Glove
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(-15, 18, 10, 12, 3);
  ctx.fill();
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(vestW * 0.5, torsoY - 10);
  ctx.rotate((armSwing * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(10, 20);
  ctx.stroke();

  // Black Glove
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.roundRect(5, 18, 10, 12, 3);
  ctx.fill();
  ctx.restore();

  // 4. HEAD WITH STYLED BROWN HAIR & THICK BLACK MUSTACHE
  const headRadius = width * 0.25;
  ctx.fillStyle = '#fdba74'; // Peach skin
  ctx.beginPath();
  ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (Determined look)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-7, headY - 2, 4, 3, 0, 0, Math.PI * 2);
  ctx.ellipse(7, headY - 2, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#15803d'; // Green eyes
  ctx.beginPath();
  ctx.arc(-7, headY - 2, 2, 0, Math.PI * 2);
  ctx.arc(7, headY - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  // Thick Brown Eyebrows
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.rect(-11, headY - 8, 8, 2.5);
  ctx.rect(3, headY - 8, 8, 2.5);
  ctx.fill();

  // THICK BLACK MUSTACHE (Signature Neighbor feature!)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(0, headY + 5, 12, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Curly mustache tips
  ctx.beginPath();
  ctx.arc(-12, headY + 3, 3, 0, Math.PI * 2);
  ctx.arc(12, headY + 3, 3, 0, Math.PI * 2);
  ctx.fill();

  // STYLED BROWN SIDE-SWEPT HAIR WITH SWIRL
  ctx.fillStyle = '#78350f'; // Dark Brown Hair
  ctx.beginPath();
  ctx.arc(0, headY - 3, headRadius + 1, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();

  // Hair Swirl at Top
  ctx.beginPath();
  ctx.moveTo(2, headY - headRadius - 2);
  ctx.quadraticCurveTo(12, headY - headRadius - 12, 6, headY - headRadius - 18);
  ctx.quadraticCurveTo(-2, headY - headRadius - 14, 0, headY - headRadius - 4);
  ctx.fill();

  ctx.restore();
}

/**
 * Main character dispatcher for Canvas rendering
 */
export function drawCharacter(opts: DrawCharacterOptions) {
  if (opts.id === 'bibendum') {
    drawBibendum(opts);
  } else if (opts.id === 'baldi') {
    drawBaldi(opts);
  } else if (opts.id === 'neighbor') {
    drawNeighbor(opts);
  }
}
