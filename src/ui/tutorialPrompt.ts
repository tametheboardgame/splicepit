import type { TutorialPromptView } from '../tutorial/tutorialFramework.js';

const PROMPT_MARGIN = 24;
const PROMPT_WIDTH = 590;
const PROMPT_HEIGHT = 96;

export function drawTutorialPrompt(
  context: CanvasRenderingContext2D,
  prompt: TutorialPromptView,
  viewportWidth: number,
  viewportHeight: number,
): void {
  const width = Math.min(PROMPT_WIDTH, Math.max(320, viewportWidth - PROMPT_MARGIN * 2));
  const x = PROMPT_MARGIN;
  const y = Math.max(PROMPT_MARGIN, viewportHeight - PROMPT_HEIGHT - PROMPT_MARGIN);
  const alpha = Math.max(0, Math.min(1, prompt.alpha));

  context.save();
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.globalAlpha = alpha;

  context.fillStyle = 'rgba(31, 48, 43, 0.34)';
  context.fillRect(x + 5, y + 6, width, PROMPT_HEIGHT);

  context.fillStyle = 'rgba(247, 240, 207, 0.95)';
  context.fillRect(x, y, width, PROMPT_HEIGHT);
  context.fillStyle = '#315449';
  context.fillRect(x, y, 7, PROMPT_HEIGHT);
  context.fillStyle = '#7c4b53';
  context.fillRect(x + 7, y, 3, PROMPT_HEIGHT);

  context.fillStyle = '#52665f';
  context.font = 'bold 10px monospace';
  context.textBaseline = 'top';
  context.fillText('FIELD NOTE', x + 22, y + 10);

  context.fillStyle = '#273c36';
  context.font = 'bold 18px monospace';
  context.fillText(prompt.title.toUpperCase(), x + 22, y + 25);

  context.fillStyle = '#45564f';
  context.font = '13px monospace';
  context.fillText(prompt.body, x + 22, y + 48, width - 44);

  let hintX = x + 22;
  const hintY = y + 69;
  context.font = 'bold 12px monospace';
  for (const hint of prompt.hints) {
    const label = hint.label;
    const chipWidth = Math.ceil(context.measureText(label).width) + 16;
    if (hintX + chipWidth > x + width - 18) break;
    context.fillStyle = '#d8d0aa';
    context.fillRect(hintX, hintY, chipWidth, 19);
    context.fillStyle = '#2b443d';
    context.fillText(label, hintX + 8, hintY + 2);
    hintX += chipWidth + 7;
  }

  context.restore();
}
