import { preloadYsp8YardAssets } from '../environment/yardSceneAssetPack.js';
import { PROTAGONIST_IDS, PROTAGONIST_SPRITES, type ProtagonistId } from '../player/protagonists.js';
import type { YardFacing } from '../world/yard.js';
import { drawSelectionPolish } from './frontDoorArt.js';

export const SELECT_VIEW_WIDTH = 1280;
export const SELECT_VIEW_HEIGHT = 720;

export const SELECT_USE_BUTTON = { x: 404, y: 662, width: 220, height: 42 } as const;
export const SELECT_RENAME_BUTTON = { x: 656, y: 662, width: 220, height: 42 } as const;
export const RENAME_INPUT_BOX = { x: 460, y: 646, width: 360, height: 34 } as const;

const FEET_Y = 610;
const CHARACTER_SCREEN_X: Record<ProtagonistId, number> = {
  milo: 340,
  theo: 520,
  ada: 710,
  pip: 900,
};

let authoredBackdrop: HTMLImageElement | null = null;
void preloadYsp8YardAssets()
  .then((assets) => {
    authoredBackdrop = assets.base;
  })
  .catch(() => {
    authoredBackdrop = null;
  });

export type SelectionPhase = 'select' | 'name';

type SelectionFrames = Record<ProtagonistId, Record<YardFacing, HTMLImageElement>>;

type SelectionOptions = {
  frames: SelectionFrames;
  selectedAvatarId: ProtagonistId;
  playerName: string;
  phase: SelectionPhase;
  now: number;
};

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, colour: string): void {
  ctx.fillStyle = colour;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawHangingSign(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 388, 14, 504, 90, '#26382f');
  rect(ctx, 394, 20, 492, 78, '#634a36');
  rect(ctx, 402, 28, 476, 62, '#b68957');
  rect(ctx, 416, 36, 448, 46, '#d7c28a');
  rect(ctx, 430, 10, 8, 24, '#634a36');
  rect(ctx, 842, 10, 8, 24, '#634a36');
  rect(ctx, 426, 6, 16, 6, '#365644');
  rect(ctx, 838, 6, 16, 6, '#365644');
  rect(ctx, 426, 42, 4, 34, '#ead59e');
  rect(ctx, 850, 42, 4, 34, '#c89a64');

  for (const [x, y] of [[406, 32], [874, 32], [406, 86], [874, 86]] as const) {
    ctx.fillStyle = '#f2dfae';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#26382f';
  ctx.font = '800 22px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('CHOOSE YOUR APPRENTICE', 640, 53);
  ctx.font = '700 11px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#53624d';
  ctx.fillText('Same bad idea. Different kid.', 640, 73);
}

function drawSelectionMarker(ctx: CanvasRenderingContext2D, x: number, y: number, now: number): void {
  const bob = Math.floor(now / 280) % 2;
  ctx.fillStyle = '#26382f';
  ctx.beginPath();
  ctx.moveTo(x, y - 105 - bob * 2);
  ctx.lineTo(x - 12, y - 125 - bob * 2);
  ctx.lineTo(x + 12, y - 125 - bob * 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d96b3b';
  ctx.beginPath();
  ctx.moveTo(x, y - 108 - bob * 2);
  ctx.lineTo(x - 8, y - 121 - bob * 2);
  ctx.lineTo(x + 8, y - 121 - bob * 2);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#365644';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 30, 10, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#f2dfae';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x, y - 2, 28, 9, 0, 0, Math.PI * 2);
  ctx.stroke();
}

function drawNameTag(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  selected: boolean,
): void {
  const width = selected ? 116 : 92;
  const left = x - width / 2;
  rect(ctx, left + 3, y + 28, width, 4, '#4d3c2d');
  rect(ctx, left, y, width, 27, '#634a36');
  rect(ctx, left + 3, y + 3, width - 6, 21, selected ? '#f2dfae' : '#d5bb82');
  if (selected) {
    rect(ctx, left + 8, y + 5, width - 16, 2, '#fff5cf');
    rect(ctx, left - 4, y + 7, 4, 13, '#d96b3b');
    rect(ctx, left + width, y + 7, 4, 13, '#7ebc69');
  }
  ctx.fillStyle = selected ? '#26382f' : '#53624d';
  ctx.font = selected
    ? '800 13px "Trebuchet MS", "Segoe UI", sans-serif'
    : '700 11px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.slice(0, 14), x, y + 14);
}

function drawActionPlank(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; width: number; height: number },
  label: string,
  primary: boolean,
): void {
  rect(ctx, box.x + 4, box.y + box.height, box.width, 5, '#4d3c2d');
  rect(ctx, box.x - 4, box.y - 4, box.width + 8, box.height + 8, primary ? '#26382f' : '#634a36');
  rect(ctx, box.x, box.y, box.width, box.height, '#634a36');
  rect(ctx, box.x + 4, box.y + 4, box.width - 8, box.height - 8, primary ? '#496448' : '#d7c28a');
  rect(ctx, box.x + 12, box.y + 8, box.width - 24, 2, primary ? '#86b979' : '#ead59e');
  rect(ctx, box.x + 10, box.y + 15, 4, 4, primary ? '#f2dfae' : '#634a36');
  rect(ctx, box.x + box.width - 14, box.y + box.height - 19, 4, 4, primary ? '#f2dfae' : '#634a36');
  ctx.fillStyle = primary ? '#fff5cf' : '#26382f';
  ctx.font = '800 14px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, box.x + box.width / 2, box.y + box.height / 2 + 2);
}

function drawRenameBoard(ctx: CanvasRenderingContext2D, selectedName: string): void {
  rect(ctx, 384, 602, 512, 116, '#26382f');
  rect(ctx, 392, 610, 496, 100, '#634a36');
  rect(ctx, 400, 618, 480, 84, '#d7c28a');
  rect(ctx, 416, 628, 448, 58, '#f2dfae');
  rect(ctx, 430, 633, 420, 3, '#fff5cf');
  ctx.fillStyle = '#26382f';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('CHANGE NAME?', 640, 637);
  ctx.font = '700 10px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#53624d';
  ctx.fillText(`Enter: use name · Esc: keep ${selectedName}`, 640, 693);
}

function drawAuthoredSelectionBackdrop(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#20382e';
  ctx.fillRect(0, 0, SELECT_VIEW_WIDTH, SELECT_VIEW_HEIGHT);
  if (!authoredBackdrop) return;
  ctx.drawImage(authoredBackdrop, 0, 0, SELECT_VIEW_WIDTH, SELECT_VIEW_HEIGHT);

  // Selection controls occupy the lower edge. A restrained transparent wash
  // preserves the authored scene while giving the four sprites/nameplates a
  // consistent readable stage without reviving the old procedural backdrop.
  const gradient = ctx.createLinearGradient(0, 430, 0, SELECT_VIEW_HEIGHT);
  gradient.addColorStop(0, 'rgba(25, 44, 36, 0)');
  gradient.addColorStop(1, 'rgba(25, 44, 36, 0.34)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 430, SELECT_VIEW_WIDTH, SELECT_VIEW_HEIGHT - 430);
}

export function drawApprenticeSelection(
  ctx: CanvasRenderingContext2D,
  options: SelectionOptions,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  drawAuthoredSelectionBackdrop(ctx);

  for (const id of PROTAGONIST_IDS) {
    const selected = id === options.selectedAvatarId;
    const feetX = CHARACTER_SCREEN_X[id];
    const feetY = FEET_Y + (selected ? 8 : 0);
    const image = options.frames[id].down;

    ctx.save();
    if (options.phase === 'name' && !selected) ctx.globalAlpha = 0.4;
    ctx.fillStyle = 'rgba(38,56,47,0.34)';
    ctx.beginPath();
    ctx.ellipse(feetX, feetY - 4, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(image, Math.round(feetX - 32), Math.round(feetY - 88), 64, 96);
    ctx.restore();
  }

  drawSelectionPolish(ctx, options.now);
  drawHangingSign(ctx);

  for (const id of PROTAGONIST_IDS) {
    const selected = id === options.selectedAvatarId;
    const screenX = CHARACTER_SCREEN_X[id];
    const screenFeetY = FEET_Y + (selected ? 8 : 0);
    if (selected) drawSelectionMarker(ctx, screenX, screenFeetY, options.now);
    const label = selected ? options.playerName : PROTAGONIST_SPRITES[id].name;
    drawNameTag(ctx, screenX, 623, label, selected);
  }

  if (options.phase === 'name') {
    drawRenameBoard(ctx, PROTAGONIST_SPRITES[options.selectedAvatarId].name);
  } else {
    drawActionPlank(ctx, SELECT_USE_BUTTON, `Use ${options.playerName}`, true);
    drawActionPlank(ctx, SELECT_RENAME_BUTTON, 'Change name?', false);
  }
}

export function selectionCharacterAt(screenX: number, screenY: number): ProtagonistId | null {
  if (screenY < 500 || screenY > 646) return null;
  for (const id of PROTAGONIST_IDS) {
    if (Math.abs(screenX - CHARACTER_SCREEN_X[id]) <= 54) return id;
  }
  return null;
}

export function pointInsideSelectionBox(
  x: number,
  y: number,
  box: { x: number; y: number; width: number; height: number },
): boolean {
  return x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
}
