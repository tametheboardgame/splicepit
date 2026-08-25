import type { DialoguePageDefinition, DialoguePageVisualState } from '../dialogue/presentation.js';
import { drawCorruptionOverlay, TITLE_VIEW_HEIGHT, TITLE_VIEW_WIDTH } from './titleCorruption.js';

export const DIALOGUE_VIEW_WIDTH = TITLE_VIEW_WIDTH;
export const DIALOGUE_VIEW_HEIGHT = TITLE_VIEW_HEIGHT;

const FRAME = { x: 112, y: 382, width: 1056, height: 250 } as const;
const PORTRAIT_SIZE = 176;
const portraitCache = new Map<string, HTMLImageElement>();

function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  colour: string,
): void {
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

function drawBrightBackdrop(ctx: CanvasRenderingContext2D, elapsedMs: number): void {
  rect(ctx, 0, 0, DIALOGUE_VIEW_WIDTH, 206, '#bce9dc');
  rect(ctx, 0, 206, DIALOGUE_VIEW_WIDTH, 166, '#91cda9');
  rect(ctx, 0, 372, DIALOGUE_VIEW_WIDTH, 348, '#6fa36e');

  polygon(ctx, [[0, 344], [186, 184], [370, 344]], '#7db68d');
  polygon(ctx, [[226, 354], [516, 140], [770, 354]], '#74aa82');
  polygon(ctx, [[648, 350], [946, 160], [1212, 350]], '#78b187');
  polygon(ctx, [[1060, 350], [1190, 224], [1280, 288], [1280, 372]], '#679b75');

  const drift = Math.floor((elapsedMs / 105) % 100);
  rect(ctx, 104 - drift, 84, 128, 18, '#eff8dc');
  rect(ctx, 152 - drift, 66, 58, 18, '#eff8dc');
  rect(ctx, 1008 + drift / 2, 102, 126, 18, '#eff8dc');
  rect(ctx, 1046 + drift / 2, 84, 52, 18, '#eff8dc');

  // Cheerful orientation-campus scenery with just enough biotech wrongness to set the tone.
  rect(ctx, 70, 292, 164, 102, '#634a36');
  polygon(ctx, [[54, 292], [152, 222], [250, 292]], '#d96b3b');
  rect(ctx, 96, 316, 34, 40, '#f2dfae');
  rect(ctx, 168, 314, 38, 80, '#365644');
  rect(ctx, 1012, 286, 132, 108, '#365644');
  rect(ctx, 1022, 296, 112, 88, '#9adbc6');
  rect(ctx, 1032, 306, 92, 68, '#6aab9b');
  ctx.fillStyle = '#d96b3b';
  ctx.beginPath();
  ctx.ellipse(1076, 350, 30, 18, -0.15, 0, Math.PI * 2);
  ctx.fill();
  rect(ctx, 1048, 325, 8, 27, '#7ebc69');
  rect(ctx, 1096, 322, 8, 31, '#7ebc69');

  for (let x = 12; x < DIALOGUE_VIEW_WIDTH; x += 46) {
    const bob = ((x / 46) % 2) * 8;
    rect(ctx, x, 672 + bob, 6, 14, '#496448');
    rect(ctx, x - 5, 668 + bob, 16, 5, '#86b979');
  }

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 42px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#365644';
  ctx.fillText('WELCOME, APPRENTICE', 640, 128);
  ctx.font = '900 14px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#496448';
  ctx.fillText('OFFICIAL ORIENTATION · ANIMAL WELFARE FORM 17-B WAIVED', 640, 174);
  ctx.restore();
}

function getPortrait(src: string): HTMLImageElement | null {
  if (typeof Image === 'undefined') return null;
  let image = portraitCache.get(src);
  if (!image) {
    image = new Image();
    image.src = src;
    portraitCache.set(src, image);
  }
  return image.complete && image.naturalWidth > 0 ? image : null;
}

function drawPortrait(
  ctx: CanvasRenderingContext2D,
  page: DialoguePageDefinition,
  visual: DialoguePageVisualState,
): void {
  if (!page.portrait) return;
  const x = FRAME.x + 26;
  const y = FRAME.y + 44;
  const corrupted = visual.corruption > 0.18;

  // Warm both portrait variants from the first frame so authored corruption pulses can swap instantly.
  const normalImage = getPortrait(page.portrait.src);
  const corruptedImage = page.portrait.corruptedSrc ? getPortrait(page.portrait.corruptedSrc) : null;
  const image = corrupted && corruptedImage ? corruptedImage : normalImage;

  rect(ctx, x - 8, y - 8, PORTRAIT_SIZE + 16, PORTRAIT_SIZE + 16, corrupted ? '#611d26' : '#365644');
  rect(ctx, x, y, PORTRAIT_SIZE, PORTRAIT_SIZE, corrupted ? '#1b1115' : '#9adbc6');
  if (image) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, x, y, PORTRAIT_SIZE, PORTRAIT_SIZE);
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle = corrupted ? '#6f2731' : '#6aab9b';
    ctx.beginPath();
    ctx.arc(x + PORTRAIT_SIZE / 2, y + 66, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = corrupted ? '#210a0d' : '#365644';
    ctx.beginPath();
    ctx.ellipse(x + PORTRAIT_SIZE / 2, y + 142, 58, 46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (corrupted) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.72, visual.corruption * 0.9);
    const slice = Math.max(2, Math.round(visual.corruption * 8));
    rect(ctx, x - 4, y + 28, PORTRAIT_SIZE + 8, slice, '#d7e971');
    rect(ctx, x + 18, y + 104, PORTRAIT_SIZE - 24, Math.max(2, slice - 2), '#b8333f');
    ctx.restore();
  }
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push('');
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = '';
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawDialogueFrame(
  ctx: CanvasRenderingContext2D,
  page: DialoguePageDefinition,
  visual: DialoguePageVisualState,
  pageIndex: number,
  totalPages: number,
): void {
  rect(ctx, FRAME.x - 10, FRAME.y - 10, FRAME.width + 20, FRAME.height + 20, '#365644');
  rect(ctx, FRAME.x, FRAME.y, FRAME.width, FRAME.height, '#9b7046');
  rect(ctx, FRAME.x + 12, FRAME.y + 12, FRAME.width - 24, FRAME.height - 24, '#f2dfae');
  rect(ctx, FRAME.x + 24, FRAME.y + 25, FRAME.width - 48, 5, '#fff0a9');
  rect(ctx, FRAME.x + 24, FRAME.y + FRAME.height - 31, FRAME.width - 48, 4, '#c89a64');

  drawPortrait(ctx, page, visual);

  const hasPortrait = Boolean(page.portrait);
  const textX = FRAME.x + (hasPortrait ? 232 : 56);
  const textWidth = FRAME.width - (hasPortrait ? 288 : 112);
  let textY = FRAME.y + 62;

  if (page.speaker) {
    const nameWidth = Math.max(160, Math.min(420, 42 + page.speaker.length * 13));
    rect(ctx, textX - 8, FRAME.y - 28, nameWidth + 16, 44, '#365644');
    rect(ctx, textX, FRAME.y - 20, nameWidth, 28, '#b78755');
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = '900 17px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.fillStyle = '#fff5cf';
    ctx.fillText(page.speaker.toUpperCase(), textX + 12, FRAME.y - 6);
    ctx.restore();
    textY += 8;
  }

  const visibleText = page.text.slice(0, visual.visibleCharacters);
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '800 24px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#26382f';
  const lines = wrapText(ctx, visibleText, textWidth);
  lines.slice(0, 5).forEach((line, index) => ctx.fillText(line, textX, textY + index * 36));
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '900 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#7e5639';
  ctx.fillText(`${pageIndex + 1} / ${totalPages}`, FRAME.x + FRAME.width - 30, FRAME.y + FRAME.height - 18);
  ctx.restore();

  if (visual.textComplete) {
    polygon(ctx, [
      [FRAME.x + FRAME.width - 64, FRAME.y + FRAME.height - 56],
      [FRAME.x + FRAME.width - 42, FRAME.y + FRAME.height - 56],
      [FRAME.x + FRAME.width - 53, FRAME.y + FRAME.height - 42],
    ], '#d96b3b');
  }
}

function drawCorruptedDialogueEcho(
  ctx: CanvasRenderingContext2D,
  page: DialoguePageDefinition,
  visual: DialoguePageVisualState,
  elapsedMs: number,
): void {
  if (visual.corruption <= 0) return;
  const amount = visual.corruption;
  const jitter = Math.round(Math.sin(elapsedMs / 17) * 7 * amount);
  ctx.save();
  ctx.globalAlpha = amount * 0.78;
  rect(ctx, FRAME.x + 12 + jitter, FRAME.y + 12, FRAME.width - 24, FRAME.height - 24, '#07100b');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 26px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#d7e971';
  ctx.fillText(page.id === 'brutality' ? 'THIS IS NORMAL' : 'PROCEDURE ACCEPTABLE', 640 - jitter, 486);
  ctx.font = '900 14px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#b8333f';
  ctx.fillText('WELFARE STATUS: IRRELEVANT', 640 + jitter, 536);
  ctx.restore();
  drawCorruptionOverlay(ctx, {
    amount,
    elapsedMs,
    width: DIALOGUE_VIEW_WIDTH,
    height: DIALOGUE_VIEW_HEIGHT,
    seed: 8039,
  });
}

export function drawDialogueScreen(
  ctx: CanvasRenderingContext2D,
  page: DialoguePageDefinition,
  visual: DialoguePageVisualState,
  pageIndex: number,
  totalPages: number,
  elapsedMs: number,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  drawBrightBackdrop(ctx, elapsedMs);
  drawDialogueFrame(ctx, page, visual, pageIndex, totalPages);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#eff8dc';
  ctx.fillText(
    visual.textComplete ? 'ENTER / SPACE / CLICK · ESC SKIPS INTRO' : 'ENTER / SPACE / CLICK REVEALS TEXT · ESC SKIPS INTRO',
    640,
    666,
  );
  ctx.restore();

  drawCorruptedDialogueEcho(ctx, page, visual, elapsedMs);
}
