import { PALETTE } from '../config.js';

function has(creature, id) { return (creature.genes ?? []).includes(id); }

export function drawCreature(scene, x, y, creature, { scale = 1, flip = false, enemy = false } = {}) {
  const c = scene.add.container(x, y);
  c.setScale(scale, scale);
  const g = scene.add.graphics();
  const bodyColour = enemy ? PALETTE.bruise : PALETTE.moss;
  const dark = enemy ? PALETTE.bruiseDark : PALETTE.mossDark;

  g.fillStyle(dark, 0.42); g.fillEllipse(4, 29, 126, 25);
  g.fillStyle(bodyColour, 1); g.lineStyle(3, PALETTE.inkDark, 0.95);
  g.fillEllipse(0, 0, 112, 72); g.strokeEllipse(0, 0, 112, 72);
  g.fillEllipse(48, -13, 57, 49); g.strokeEllipse(48, -13, 57, 49);

  g.fillStyle(bodyColour, 1);
  g.fillEllipse(42, -54, 18, 59); g.strokeEllipse(42, -54, 18, 59);
  g.fillEllipse(57, -52, 16, 51); g.strokeEllipse(57, -52, 16, 51);

  g.fillRoundedRect(-39, 25, 24, 24, 8); g.strokeRoundedRect(-39, 25, 24, 24, 8);
  g.fillRoundedRect(18, 25, 25, 23, 8); g.strokeRoundedRect(18, 25, 25, 23, 8);

  g.fillStyle(PALETTE.inkDark, 1); g.fillCircle(61, -17, 4);
  g.lineStyle(2, PALETTE.inkDark, 1); g.lineBetween(72, -4, 82, -2); g.lineBetween(82, -2, 74, 2);

  if (has(creature, 'moth_sense')) {
    g.lineStyle(2, PALETTE.bone, 0.9);
    g.lineBetween(50, -68, 32, -88); g.lineBetween(32, -88, 24, -82); g.lineBetween(32, -88, 36, -98);
    g.lineBetween(58, -68, 75, -88); g.lineBetween(75, -88, 83, -82); g.lineBetween(75, -88, 71, -98);
  }
  if (has(creature, 'boar_muscle')) {
    g.lineStyle(7, PALETTE.rustDark, 0.7); g.lineBetween(-44, -2, -14, 8); g.lineBetween(-38, 11, -9, 16);
    g.fillStyle(PALETTE.bone, 1); g.fillTriangle(76, 3, 95, 7, 79, 14); g.lineStyle(2, PALETTE.inkDark, 1); g.strokeTriangle(76, 3, 95, 7, 79, 14);
  }
  if (has(creature, 'gecko_regeneration')) {
    g.lineStyle(3, PALETTE.acid, 0.9);
    g.strokeCircle(-23, -5, 9); g.lineBetween(-30, -11, -15, 1); g.lineBetween(-29, 2, -17, -12);
  }
  if (has(creature, 'toad_hide')) {
    g.fillStyle(PALETTE.acid, 0.55);
    [-31,-13,7,25].forEach((dx, i) => g.fillCircle(dx, -17 + (i % 2) * 19, 5 + (i % 3)));
  }

  if (creature.mutation?.id === 'overgrowth') {
    g.fillStyle(PALETTE.bruise, 0.85); g.fillCircle(-8, -38, 13); g.fillCircle(9, -36, 9);
  }
  if (creature.mutation?.id === 'calcification') {
    g.fillStyle(PALETTE.bone, 1); g.fillTriangle(-27, -35, -18, -59, -9, -31);
  }
  if (creature.mutation?.id === 'tremor') {
    g.lineStyle(2, PALETTE.rust, 0.75); g.lineBetween(-63, -18, -78, -22); g.lineBetween(-64, 0, -81, 2);
  }

  c.add(g);
  if (flip) c.scaleX *= -1;
  return c;
}
