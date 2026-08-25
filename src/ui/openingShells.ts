import type {
  OpeningInventoryEntry,
  OpeningObjectiveDefinition,
  OpeningShellId,
} from '../onboarding/openingShells.js';

export interface OpeningShellRenderState {
  readonly activeShell: OpeningShellId | null;
  readonly inventory: readonly OpeningInventoryEntry[];
  readonly objective: OpeningObjectiveDefinition;
  readonly objectiveStep: number;
  readonly objectiveCount: number;
  readonly playerX: number;
  readonly playerY: number;
  readonly worldWidth: number;
  readonly worldHeight: number;
}

function roundedRectPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.lineTo(x + width - r, y);
  context.quadraticCurveTo(x + width, y, x + width, y + r);
  context.lineTo(x + width, y + height - r);
  context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  context.lineTo(x + r, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - r);
  context.lineTo(x, y + r);
  context.quadraticCurveTo(x, y, x + r, y);
  context.closePath();
}

function fillPanel(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke: string,
  lineWidth = 4,
): void {
  roundedRectPath(context, x, y, width, height, 14);
  context.fillStyle = fill;
  context.fill();
  context.strokeStyle = stroke;
  context.lineWidth = lineWidth;
  context.stroke();
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
): void {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth || line === '') {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length >= maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  lines.forEach((entry, index) => context.fillText(entry, x, y + index * lineHeight));
}

export function drawOpeningObjectiveTracker(
  context: CanvasRenderingContext2D,
  objective: OpeningObjectiveDefinition,
  objectiveStep: number,
  objectiveCount: number,
): void {
  context.save();
  fillPanel(context, 22, 20, 410, 88, 'rgba(249, 235, 185, 0.95)', '#3c6b61', 3);
  context.fillStyle = '#284f47';
  context.font = '700 15px monospace';
  context.fillText(`OBJECTIVE ${objectiveStep}/${objectiveCount}`, 42, 46);
  context.fillStyle = '#5b3027';
  context.font = '700 21px monospace';
  context.fillText(objective.title, 42, 73);
  context.fillStyle = '#3f443d';
  context.font = '14px monospace';
  context.fillText(objective.detail, 42, 96, 365);
  context.restore();
}

function drawShellChrome(
  context: CanvasRenderingContext2D,
  title: string,
  shortcut: string,
  viewportWidth: number,
  viewportHeight: number,
): { x: number; y: number; width: number; height: number } {
  context.fillStyle = 'rgba(18, 39, 36, 0.56)';
  context.fillRect(0, 0, viewportWidth, viewportHeight);

  const width = 820;
  const height = 540;
  const x = Math.round((viewportWidth - width) / 2);
  const y = Math.round((viewportHeight - height) / 2);
  fillPanel(context, x, y, width, height, '#f4e7b7', '#315d54', 6);

  context.fillStyle = '#315d54';
  context.fillRect(x + 8, y + 8, width - 16, 70);
  context.fillStyle = '#fff2c4';
  context.font = '700 31px monospace';
  context.fillText(title, x + 32, y + 53);
  context.font = '700 15px monospace';
  context.textAlign = 'right';
  context.fillText(`${shortcut} TOGGLE  •  ESC CLOSE`, x + width - 30, y + 50);
  context.textAlign = 'left';
  return { x, y, width, height };
}

function drawBag(
  context: CanvasRenderingContext2D,
  state: OpeningShellRenderState,
  viewportWidth: number,
  viewportHeight: number,
): void {
  const panel = drawShellChrome(context, 'BAG', 'B', viewportWidth, viewportHeight);
  const startY = panel.y + 112;

  context.fillStyle = '#5b3027';
  context.font = '700 17px monospace';
  context.fillText('OPENING INVENTORY', panel.x + 38, startY);

  if (state.inventory.length === 0) {
    context.fillStyle = '#3f443d';
    context.font = '16px monospace';
    context.fillText('Nothing but lint and poor decisions.', panel.x + 38, startY + 50);
    return;
  }

  state.inventory.slice(0, 5).forEach((entry, index) => {
    const cardY = startY + 26 + index * 118;
    fillPanel(context, panel.x + 34, cardY, panel.width - 68, 96, '#fff4ca', '#b38a4a', 2);
    context.fillStyle = '#315d54';
    context.font = '700 19px monospace';
    context.fillText(entry.label, panel.x + 56, cardY + 31);
    context.fillStyle = '#7a4a2d';
    context.font = '700 15px monospace';
    context.textAlign = 'right';
    context.fillText(`×${entry.quantity}`, panel.x + panel.width - 58, cardY + 31);
    context.textAlign = 'left';
    context.fillStyle = '#6c5b42';
    context.font = '13px monospace';
    context.fillText(entry.kind.toUpperCase(), panel.x + 56, cardY + 54);
    context.fillStyle = '#3f443d';
    context.font = '14px monospace';
    drawWrappedText(context, entry.description, panel.x + 56, cardY + 77, panel.width - 150, 18, 1);
  });
}

function drawMap(
  context: CanvasRenderingContext2D,
  state: OpeningShellRenderState,
  viewportWidth: number,
  viewportHeight: number,
): void {
  const panel = drawShellChrome(context, 'MAP', 'M', viewportWidth, viewportHeight);
  const mapX = panel.x + 36;
  const mapY = panel.y + 108;
  const mapWidth = 492;
  const mapHeight = 366;

  fillPanel(context, mapX, mapY, mapWidth, mapHeight, '#d8d79b', '#6f7d4d', 3);

  context.fillStyle = '#aac875';
  context.fillRect(mapX + 16, mapY + 16, mapWidth - 32, mapHeight - 32);
  context.fillStyle = '#c9b06f';
  context.fillRect(mapX + 40, mapY + 155, mapWidth - 80, 62);
  context.fillStyle = '#7eb4a4';
  context.fillRect(mapX + 310, mapY + 28, 126, 105);
  context.fillStyle = '#8c6b4d';
  context.fillRect(mapX + 62, mapY + 48, 128, 88);
  context.fillRect(mapX + 250, mapY + 235, 156, 92);

  context.strokeStyle = '#f1df9d';
  context.lineWidth = 7;
  context.beginPath();
  context.moveTo(mapX + 102, mapY + 286);
  context.lineTo(mapX + 176, mapY + 192);
  context.lineTo(mapX + 282, mapY + 186);
  context.lineTo(mapX + 360, mapY + 111);
  context.stroke();

  const px = mapX + 18 + (Math.max(0, Math.min(state.worldWidth, state.playerX)) / state.worldWidth) * (mapWidth - 36);
  const py = mapY + 18 + (Math.max(0, Math.min(state.worldHeight, state.playerY)) / state.worldHeight) * (mapHeight - 36);
  context.fillStyle = '#6b2430';
  context.beginPath();
  context.arc(px, py, 10, 0, Math.PI * 2);
  context.fill();
  context.strokeStyle = '#fff4ca';
  context.lineWidth = 3;
  context.stroke();

  context.fillStyle = '#284f47';
  context.font = '700 14px monospace';
  context.fillText('APPRENTICE SPLICER YARD', mapX + 24, mapY + 28);
  context.fillStyle = '#5b3027';
  context.fillText('YOU', px + 16, py + 5);

  const infoX = panel.x + 556;
  const infoY = panel.y + 116;
  context.fillStyle = '#315d54';
  context.font = '700 16px monospace';
  context.fillText(`OBJECTIVE ${state.objectiveStep}/${state.objectiveCount}`, infoX, infoY);
  context.fillStyle = '#5b3027';
  context.font = '700 22px monospace';
  drawWrappedText(context, state.objective.title, infoX, infoY + 34, 220, 26, 2);
  context.fillStyle = '#3f443d';
  context.font = '15px monospace';
  drawWrappedText(context, state.objective.detail, infoX, infoY + 104, 220, 22, 6);

  context.fillStyle = '#6c5b42';
  context.font = '13px monospace';
  drawWrappedText(
    context,
    'This is the opening route shell, not the final world map. New areas will be added only as the slice reaches them.',
    infoX,
    panel.y + panel.height - 126,
    220,
    19,
    5,
  );
}

export function drawOpeningShell(
  context: CanvasRenderingContext2D,
  state: OpeningShellRenderState,
  viewportWidth: number,
  viewportHeight: number,
): void {
  if (state.activeShell === null) return;
  context.save();
  if (state.activeShell === 'bag') drawBag(context, state, viewportWidth, viewportHeight);
  else drawMap(context, state, viewportWidth, viewportHeight);
  context.restore();
}
