export type FrontDoorVariant = 'title' | 'menu' | 'dialogue';

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function polygon(ctx: CanvasRenderingContext2D, points: readonly [number, number][], colour: string): void {
  ctx.fillStyle = colour;
  ctx.beginPath();
  points.forEach(([x, y], index) => index === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.closePath();
  ctx.fill();
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(Math.round(x), Math.round(y), radius, 0, Math.PI * 2);
  ctx.fill();
}

function line(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  colour: string,
  width = 2,
): void {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(Math.round(fromX), Math.round(fromY));
  ctx.lineTo(Math.round(toX), Math.round(toY));
  ctx.stroke();
}

function drawCampusTower(ctx: CanvasRenderingContext2D, x: number, y: number, mirror = false): void {
  const direction = mirror ? -1 : 1;
  rect(ctx, x - 42, y, 84, 126, '#315f5b');
  rect(ctx, x - 34, y + 8, 68, 110, '#d7c28a');
  rect(ctx, x - 28, y + 18, 56, 90, '#ead59e');
  rect(ctx, x - 22, y + 30, 18, 24, '#9adbc6');
  rect(ctx, x + 6, y + 30, 18, 24, '#9adbc6');
  rect(ctx, x - 22, y + 66, 18, 24, '#9adbc6');
  rect(ctx, x + 6, y + 66, 18, 24, '#9adbc6');
  rect(ctx, x - 10, y + 86, 20, 32, '#634a36');
  polygon(ctx, [[x - 54, y], [x, y - 42], [x + 54, y]], '#d96b3b');
  rect(ctx, x - 24, y - 12, 48, 8, '#f2dfae');
  line(ctx, x + direction * 24, y - 18, x + direction * 44, y - 50, '#365644', 6);
  circle(ctx, x + direction * 47, y - 54, 7, '#f2dfae');
  circle(ctx, x + direction * 47, y - 54, 3, '#d96b3b');
}

function drawSpecimenPod(ctx: CanvasRenderingContext2D, x: number, y: number, elapsedMs: number, scale = 1): void {
  const blink = Math.floor(elapsedMs / 620) % 4 === 0;
  rect(ctx, x - 34 * scale, y - 52 * scale, 68 * scale, 94 * scale, '#365644');
  rect(ctx, x - 28 * scale, y - 46 * scale, 56 * scale, 80 * scale, '#9adbc6');
  rect(ctx, x - 22 * scale, y - 40 * scale, 44 * scale, 68 * scale, '#6aab9b');
  rect(ctx, x - 17 * scale, y - 34 * scale, 34 * scale, 56 * scale, '#bce9dc');
  circle(ctx, x, y - 2 * scale, 15 * scale, '#d96b3b');
  polygon(ctx, [
    [x - 15 * scale, y - 5 * scale],
    [x - 26 * scale, y - 22 * scale],
    [x - 19 * scale, y + 2 * scale],
  ], '#7ebc69');
  polygon(ctx, [
    [x + 15 * scale, y - 4 * scale],
    [x + 28 * scale, y - 20 * scale],
    [x + 20 * scale, y + 3 * scale],
  ], '#7ebc69');
  rect(ctx, x - 11 * scale, y + 11 * scale, 7 * scale, 18 * scale, '#7ebc69');
  rect(ctx, x + 5 * scale, y + 11 * scale, 7 * scale, 18 * scale, '#7ebc69');
  circle(ctx, x + 5 * scale, y - 6 * scale, 3.2 * scale, '#26382f');
  if (!blink) circle(ctx, x + 5 * scale, y - 7 * scale, 1.2 * scale, '#fff5cf');
  rect(ctx, x - 40 * scale, y + 42 * scale, 80 * scale, 10 * scale, '#634a36');
  rect(ctx, x - 30 * scale, y + 52 * scale, 10 * scale, 14 * scale, '#7e5639');
  rect(ctx, x + 20 * scale, y + 52 * scale, 10 * scale, 14 * scale, '#7e5639');
}

function drawFenceAndPlants(ctx: CanvasRenderingContext2D, y: number, startX: number, endX: number): void {
  line(ctx, startX, y, endX, y, '#634a36', 5);
  line(ctx, startX, y + 18, endX, y + 18, '#7e5639', 4);
  for (let x = startX; x <= endX; x += 38) {
    rect(ctx, x, y - 12, 6, 44, '#9b7046');
    if ((x - startX) % 76 === 0) {
      rect(ctx, x + 12, y + 20, 3, 14, '#496448');
      rect(ctx, x + 7, y + 23, 12, 4, '#86b979');
      circle(ctx, x + 17, y + 19, 4, '#d96b3b');
    }
  }
}

function drawPennants(ctx: CanvasRenderingContext2D, y: number, offset: number): void {
  line(ctx, 334, y, 946, y + 6, '#365644', 2);
  for (let x = 350; x <= 930; x += 52) {
    const bob = ((x + offset) / 52) % 2 > 1 ? 2 : 0;
    polygon(ctx, [
      [x, y + 1],
      [x + 24, y + 1],
      [x + 12, y + 20 + bob],
    ], x % 104 === 38 ? '#d96b3b' : '#f2dfae');
  }
}

export function drawFrontDoorBackdropPolish(
  ctx: CanvasRenderingContext2D,
  elapsedMs: number,
  variant: FrontDoorVariant,
): void {
  const title = variant === 'title';
  const dialogue = variant === 'dialogue';
  const baseY = dialogue ? 250 : 360;

  ctx.save();
  ctx.globalAlpha = title ? 0.86 : 0.78;
  rect(ctx, 0, baseY - 20, 1280, 18, '#5f8d6b');
  rect(ctx, 272, baseY - 72, 170, 58, '#6fa078');
  rect(ctx, 842, baseY - 86, 188, 72, '#6b9974');
  rect(ctx, 452, baseY - 54, 96, 40, '#6fa078');
  rect(ctx, 730, baseY - 48, 92, 34, '#6fa078');
  for (const x of [296, 342, 394, 864, 914, 972]) {
    rect(ctx, x, baseY - 98 - (x % 3) * 3, 12, 48, '#547862');
    rect(ctx, x - 4, baseY - 102 - (x % 3) * 3, 20, 6, '#365644');
  }
  ctx.restore();

  if (!dialogue) {
    drawCampusTower(ctx, 90, 414, false);
    drawCampusTower(ctx, 1190, 430, true);
    drawSpecimenPod(ctx, title ? 183 : 158, 548, elapsedMs, title ? 0.72 : 0.62);
  } else {
    drawSpecimenPod(ctx, 1188, 340, elapsedMs, 0.52);
  }

  const fenceY = dialogue ? 356 : 586;
  drawFenceAndPlants(ctx, fenceY, 0, title ? 230 : 250);
  drawFenceAndPlants(ctx, fenceY, title ? 1050 : 1030, 1278);

  if (title) {
    rect(ctx, 24, 520, 118, 42, '#634a36');
    rect(ctx, 30, 526, 106, 30, '#d7c28a');
    ctx.fillStyle = '#365644';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '800 10px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.fillText('WELCOME', 83, 537);
    ctx.font = '700 8px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.fillText('LIABILITY WAIVED', 83, 549);
  }
}

export function drawTitleLogoPolish(ctx: CanvasRenderingContext2D, reveal: number, elapsedMs: number): void {
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, reveal));

  const nodes = [
    [292, 330, 326, 290], [326, 290, 366, 318], [954, 302, 992, 338], [992, 338, 958, 386],
  ] as const;
  for (const [x1, y1, x2, y2] of nodes) {
    line(ctx, x1, y1, x2, y2, '#f2dfae', 4);
    circle(ctx, x1, y1, 8, '#365644');
    circle(ctx, x1, y1, 4, '#9adbc6');
    circle(ctx, x2, y2, 8, '#365644');
    circle(ctx, x2, y2, 4, '#d96b3b');
  }

  const pulse = Math.floor(elapsedMs / 520) % 2;
  rect(ctx, 506, 482, 268, 42, '#365644');
  rect(ctx, 512, 488, 256, 30, '#f2dfae');
  rect(ctx, 522, 493, 236, 4, pulse ? '#fff5cf' : '#ead59e');
  circle(ctx, 530, 503, 4, '#7ebc69');
  circle(ctx, 750, 503, 4, '#d96b3b');
  ctx.restore();
}

export function drawMenuBackdropPolish(ctx: CanvasRenderingContext2D, elapsedMs: number): void {
  drawPennants(ctx, 284, Math.floor(elapsedMs / 500));
  rect(ctx, 430, 294, 420, 20, '#365644');
  rect(ctx, 446, 298, 388, 12, '#f2dfae');
  circle(ctx, 448, 304, 4, '#d96b3b');
  circle(ctx, 832, 304, 4, '#7ebc69');
  rect(ctx, 292, 392, 44, 184, '#634a36');
  rect(ctx, 300, 400, 28, 168, '#9b7046');
  line(ctx, 314, 414, 352, 444, '#365644', 5);
  circle(ctx, 355, 447, 8, '#9adbc6');
  rect(ctx, 944, 408, 40, 166, '#315f5b');
  rect(ctx, 952, 416, 24, 150, '#6aab9b');
  for (let y = 434; y <= 540; y += 26) circle(ctx, 964, y, 5, y % 52 === 18 ? '#d96b3b' : '#f2dfae');
}

export function drawDialogueBackdropPolish(ctx: CanvasRenderingContext2D, elapsedMs: number): void {
  drawPennants(ctx, 214, Math.floor(elapsedMs / 580));
  rect(ctx, 270, 248, 162, 80, '#634a36');
  rect(ctx, 278, 256, 146, 64, '#d7c28a');
  ctx.fillStyle = '#365644';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 11px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('ORIENTATION', 351, 274);
  ctx.font = '700 8px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('PLEASE KEEP LIMBS ATTACHED', 351, 292);
  ctx.fillText('WHERE PRACTICABLE', 351, 305);
  line(ctx, 432, 278, 488, 318, '#365644', 4);
  circle(ctx, 492, 321, 7, '#d96b3b');
}

export function drawSelectionPolish(ctx: CanvasRenderingContext2D, now: number): void {
  line(ctx, 212, 104, 1068, 104, '#365644', 3);
  for (let x = 232; x <= 1040; x += 54) {
    polygon(ctx, [[x, 105], [x + 24, 105], [x + 12, 124]], x % 108 === 16 ? '#d96b3b' : '#f2dfae');
  }

  rect(ctx, 48, 566, 134, 70, '#634a36');
  rect(ctx, 56, 574, 118, 54, '#9b7046');
  rect(ctx, 66, 584, 98, 8, '#b78755');
  ctx.fillStyle = '#f2dfae';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 9px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('APPRENTICE PPE', 115, 605);
  circle(ctx, 160, 617, 4, '#d96b3b');

  rect(ctx, 1098, 560, 128, 76, '#365644');
  rect(ctx, 1106, 568, 112, 60, '#9adbc6');
  rect(ctx, 1114, 576, 96, 44, '#6aab9b');
  circle(ctx, 1162, 598, 15, '#d96b3b');
  circle(ctx, 1168, 594, 3, '#26382f');
  if (Math.floor(now / 720) % 3 !== 0) circle(ctx, 1168, 593, 1, '#fff5cf');
  line(ctx, 1118, 620, 1118, 646, '#634a36', 5);
  line(ctx, 1206, 620, 1206, 646, '#634a36', 5);
}

function noise(seed: number): number {
  let value = seed | 0;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  return (value >>> 0) / 4294967295;
}

export function drawCorruptionPolish(
  ctx: CanvasRenderingContext2D,
  amount: number,
  elapsedMs: number,
  width: number,
  height: number,
  seed = 4919,
): void {
  if (amount <= 0) return;
  const frame = Math.floor(elapsedMs / 28);
  ctx.save();

  ctx.globalAlpha = Math.min(0.72, amount * 0.74);
  for (let i = 0; i < 8; i += 1) {
    const y = Math.floor(noise(seed + frame * 43 + i * 101) * height);
    const x = Math.floor(noise(seed + frame * 59 + i * 137) * width * 0.72);
    const w = 40 + Math.floor(noise(seed + i * 181) * width * 0.28);
    const h = 2 + Math.floor(noise(seed + frame * 7 + i * 211) * 8);
    rect(ctx, x - 10 * amount, y, w, h, i % 2 === 0 ? '#d7e971' : '#b8333f');
    rect(ctx, x + 9 * amount, y + h + 2, Math.max(12, w - 18), 2, '#07100b');
  }

  ctx.globalAlpha = Math.min(0.55, amount * 0.58);
  const centreX = width * (0.18 + noise(seed + frame * 19) * 0.64);
  const centreY = height * (0.2 + noise(seed + frame * 23) * 0.58);
  for (let branch = 0; branch < 7; branch += 1) {
    const angle = noise(seed + frame * 29 + branch * 67) * Math.PI * 2;
    const length = 70 + noise(seed + frame * 31 + branch * 83) * 180;
    const endX = centreX + Math.cos(angle) * length;
    const endY = centreY + Math.sin(angle) * length * 0.62;
    line(ctx, centreX, centreY, endX, endY, branch % 3 === 0 ? '#b8333f' : '#d7e971', 2 + amount * 2);
    circle(ctx, endX, endY, 2 + amount * 3, '#07100b');
  }

  ctx.globalAlpha = Math.min(0.88, amount * 0.9);
  const eyeX = Math.round(width * (0.5 + (noise(seed + frame * 11) - 0.5) * 0.4));
  const eyeY = Math.round(height * (0.42 + (noise(seed + frame * 13) - 0.5) * 0.26));
  polygon(ctx, [[eyeX - 24, eyeY], [eyeX, eyeY - 10], [eyeX + 24, eyeY], [eyeX, eyeY + 10]], '#07100b');
  circle(ctx, eyeX, eyeY, 6, '#d7e971');
  circle(ctx, eyeX, eyeY, 2, '#b8333f');
  ctx.restore();
}
