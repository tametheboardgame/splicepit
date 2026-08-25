import { drawFrontDoorBackdropPolish, drawMenuBackdropPolish } from './frontDoorArt.js';
import { TITLE_VIEW_HEIGHT, TITLE_VIEW_WIDTH } from './titleCorruption.js';

export type MainMenuItemId = 'new-game' | 'continue' | 'settings';
export type MainMenuScreen = 'menu' | 'settings';

export type MainMenuItem = {
  id: MainMenuItemId;
  label: string;
  enabled: boolean;
  note: string;
};

export type MainMenuRenderState = {
  screen: MainMenuScreen;
  selectedIndex: number;
  statusText?: string;
};

export const MAIN_MENU_ITEMS: readonly MainMenuItem[] = [
  { id: 'new-game', label: 'NEW GAME', enabled: true, note: 'Begin a fresh apprenticeship.' },
  { id: 'continue', label: 'CONTINUE', enabled: false, note: 'No checkpoint available yet.' },
  { id: 'settings', label: 'SETTINGS', enabled: true, note: 'Adjust the machinery.' },
];

export const MAIN_MENU_RECTS = [
  { x: 456, y: 344, width: 368, height: 64 },
  { x: 456, y: 424, width: 368, height: 64 },
  { x: 456, y: 504, width: 368, height: 64 },
] as const;

export const SETTINGS_BACK_RECT = { x: 500, y: 516, width: 280, height: 58 } as const;

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

function drawBackdrop(ctx: CanvasRenderingContext2D, elapsedMs: number): void {
  rect(ctx, 0, 0, TITLE_VIEW_WIDTH, 220, '#bce9dc');
  rect(ctx, 0, 220, TITLE_VIEW_WIDTH, 160, '#91cda9');
  rect(ctx, 0, 380, TITLE_VIEW_WIDTH, 340, '#6fa36e');

  polygon(ctx, [[0, 344], [196, 176], [374, 344]], '#7db68d');
  polygon(ctx, [[246, 356], [520, 148], [760, 356]], '#74aa82');
  polygon(ctx, [[672, 350], [958, 166], [1216, 350]], '#78b187');
  polygon(ctx, [[1060, 350], [1204, 210], [1280, 274], [1280, 380]], '#679b75');

  const drift = Math.floor((elapsedMs / 110) % 90);
  rect(ctx, 110 - drift, 92, 116, 18, '#eff8dc');
  rect(ctx, 150 - drift, 74, 52, 18, '#eff8dc');
  rect(ctx, 1000 + drift / 2, 114, 118, 18, '#eff8dc');
  rect(ctx, 1038 + drift / 2, 96, 48, 18, '#eff8dc');

  rect(ctx, 0, 596, TITLE_VIEW_WIDTH, 124, '#5b895e');
  for (let x = 14; x < TITLE_VIEW_WIDTH; x += 42) {
    const bob = ((x / 42) % 2) * 8;
    rect(ctx, x, 622 + bob, 6, 16, '#496448');
    rect(ctx, x - 6, 618 + bob, 18, 6, '#86b979');
  }

  rect(ctx, 98, 398, 132, 170, '#365644');
  rect(ctx, 106, 406, 116, 154, '#9adbc6');
  rect(ctx, 116, 420, 96, 126, '#6aab9b');
  rect(ctx, 126, 432, 76, 104, '#bce9dc');
  ctx.fillStyle = '#d96b3b';
  ctx.beginPath();
  ctx.ellipse(164, 500, 27, 19, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#26382f';
  ctx.beginPath();
  ctx.arc(177, 495, 4, 0, Math.PI * 2);
  ctx.fill();
  rect(ctx, 136, 466, 9, 30, '#7ebc69');
  rect(ctx, 188, 462, 8, 36, '#7ebc69');
  rect(ctx, 88, 566, 152, 18, '#634a36');

  rect(ctx, 1060, 446, 106, 122, '#634a36');
  polygon(ctx, [[1038, 446], [1113, 388], [1188, 446]], '#d96b3b');
  rect(ctx, 1072, 466, 24, 38, '#f2dfae');
  rect(ctx, 1126, 470, 24, 98, '#365644');
}

function drawLogo(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.font = '900 88px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#26382f';
  ctx.strokeText('SplicePit', 640, 184);
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#d96b3b';
  ctx.strokeText('SplicePit', 640, 180);
  ctx.fillStyle = '#fff0a9';
  ctx.fillText('SplicePit', 640, 176);

  ctx.font = '900 15px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#365644';
  ctx.fillText('GENETIC EXCELLENCE · ETHICS OPTIONAL', 640, 246);
  ctx.restore();
}

function drawWoodPlank(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  selected: boolean,
  disabled: boolean,
): void {
  const border = selected && !disabled ? '#fff0a9' : '#365644';
  rect(ctx, x + 6, y + height + 3, width, 5, '#4d3c2d');
  rect(ctx, x - 6, y - 6, width + 12, height + 12, border);
  rect(ctx, x, y, width, height, disabled ? '#776b58' : '#9b7046');
  rect(ctx, x + 8, y + 8, width - 16, height - 16, disabled ? '#8a7e69' : '#b78755');
  rect(ctx, x + 18, y + 14, width - 36, 4, disabled ? '#9a8e77' : '#c89a64');
  rect(ctx, x + 28, y + height - 18, width - 56, 4, disabled ? '#685f51' : '#7e5639');
  rect(ctx, x + 14, y + 18, 5, 5, '#4d3c2d');
  rect(ctx, x + width - 19, y + height - 23, 5, 5, '#4d3c2d');
  if (selected && !disabled) {
    rect(ctx, x - 18, y + 17, 10, height - 34, '#d96b3b');
    rect(ctx, x + width + 8, y + 17, 10, height - 34, '#7ebc69');
  }
}

function drawMenu(ctx: CanvasRenderingContext2D, state: MainMenuRenderState): void {
  rect(ctx, 625, 306, 30, 304, '#634a36');
  rect(ctx, 632, 306, 16, 304, '#7e5639');

  MAIN_MENU_ITEMS.forEach((item, index) => {
    const bounds = MAIN_MENU_RECTS[index];
    const selected = state.selectedIndex === index;
    drawWoodPlank(ctx, bounds.x, bounds.y, bounds.width, bounds.height, selected, !item.enabled);

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '900 27px "Trebuchet MS", "Segoe UI", sans-serif';
    ctx.fillStyle = item.enabled ? '#fff5cf' : '#d0c4a8';
    ctx.fillText(item.label, 640, bounds.y + 29);
    if (!item.enabled) {
      ctx.font = '900 10px "Trebuchet MS", "Segoe UI", sans-serif';
      ctx.fillStyle = '#514c42';
      ctx.fillText('CHECKPOINT REQUIRED', 640, bounds.y + 51);
    }
    ctx.restore();
  });

  const selectedItem = MAIN_MENU_ITEMS[state.selectedIndex];
  const status = state.statusText || selectedItem?.note || '';
  rect(ctx, 410, 604, 460, 62, '#365644');
  rect(ctx, 418, 612, 444, 46, '#496448');
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '800 14px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#eff8dc';
  ctx.fillText(status, 640, 626);
  ctx.font = '800 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#dff6e8';
  ctx.fillText('↑ ↓ / W S · ENTER · CLICK', 640, 648);
  ctx.restore();
}

function drawSettings(ctx: CanvasRenderingContext2D): void {
  rect(ctx, 378, 278, 524, 334, '#26382f');
  rect(ctx, 386, 286, 508, 318, '#365644');
  rect(ctx, 396, 296, 488, 298, '#9b7046');
  rect(ctx, 410, 310, 460, 270, '#b78755');
  rect(ctx, 428, 330, 424, 6, '#c89a64');
  rect(ctx, 428, 466, 424, 5, '#7e5639');
  rect(ctx, 398, 344, 8, 160, '#315f5b');
  rect(ctx, 874, 344, 8, 160, '#315f5b');

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#fff5cf';
  ctx.font = '900 34px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillText('SETTINGS', 640, 368);
  ctx.font = '800 17px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#f2dfae';
  ctx.fillText('The useful knobs arrive with the systems they control.', 640, 416);
  ctx.font = '700 14px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#ead59e';
  ctx.fillText('For now, please refrain from licking the machinery.', 640, 448);
  ctx.restore();

  drawWoodPlank(
    ctx,
    SETTINGS_BACK_RECT.x,
    SETTINGS_BACK_RECT.y,
    SETTINGS_BACK_RECT.width,
    SETTINGS_BACK_RECT.height,
    true,
    false,
  );
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '900 24px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#fff5cf';
  ctx.fillText('BACK', 640, SETTINGS_BACK_RECT.y + 28);
  ctx.font = '800 12px "Trebuchet MS", "Segoe UI", sans-serif';
  ctx.fillStyle = '#eff8dc';
  ctx.fillText('ENTER / ESC / CLICK', 640, 636);
  ctx.restore();
}

export function firstEnabledMenuIndex(): number {
  const index = MAIN_MENU_ITEMS.findIndex((item) => item.enabled);
  return index < 0 ? 0 : index;
}

export function moveMainMenuSelection(currentIndex: number, direction: -1 | 1): number {
  if (!MAIN_MENU_ITEMS.some((item) => item.enabled)) return currentIndex;
  let index = Math.max(0, Math.min(MAIN_MENU_ITEMS.length - 1, currentIndex));
  for (let attempt = 0; attempt < MAIN_MENU_ITEMS.length; attempt += 1) {
    index = (index + direction + MAIN_MENU_ITEMS.length) % MAIN_MENU_ITEMS.length;
    if (MAIN_MENU_ITEMS[index].enabled) return index;
  }
  return currentIndex;
}

export function mainMenuHitTest(x: number, y: number): number | null {
  const index = MAIN_MENU_RECTS.findIndex((bounds) => (
    x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height
  ));
  return index < 0 ? null : index;
}

export function settingsBackHitTest(x: number, y: number): boolean {
  return x >= SETTINGS_BACK_RECT.x
    && x <= SETTINGS_BACK_RECT.x + SETTINGS_BACK_RECT.width
    && y >= SETTINGS_BACK_RECT.y
    && y <= SETTINGS_BACK_RECT.y + SETTINGS_BACK_RECT.height;
}

export function drawMainMenuScreen(
  ctx: CanvasRenderingContext2D,
  state: MainMenuRenderState,
  elapsedMs: number,
): void {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  drawBackdrop(ctx, elapsedMs);
  drawFrontDoorBackdropPolish(ctx, elapsedMs, 'menu');
  drawLogo(ctx);
  drawMenuBackdropPolish(ctx, elapsedMs);
  if (state.screen === 'settings') drawSettings(ctx);
  else drawMenu(ctx, state);
}
