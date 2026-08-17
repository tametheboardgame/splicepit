import Phaser from 'phaser';
import { PALETTE } from '../config.js';
import type { PhenotypeBlueprint, PhenotypeComponent } from '../domain/phenotype.js';

export interface PhenotypeRenderOptions {
  scale?: number;
  flip?: boolean;
  enemy?: boolean;
}

function component(phenotype: PhenotypeBlueprint, kind: string): PhenotypeComponent | undefined {
  return phenotype.components.find((entry) => entry.kind === kind);
}

function surfaceIntensity(phenotype: PhenotypeBlueprint, kind: string): number {
  return phenotype.surfaceLayers.find((entry) => entry.kind === kind)?.intensity ?? 0;
}

function baseColours(phenotype: PhenotypeBlueprint, enemy: boolean): { body: number; dark: number } {
  if (enemy) return { body: PALETTE.bruise, dark: PALETTE.bruiseDark };
  if (phenotype.baseAnimalId === 'goat') return { body: PALETTE.bone, dark: PALETTE.blueGrey };
  if (phenotype.baseAnimalId === 'pig') return { body: PALETTE.rust, dark: PALETTE.rustDark };
  return { body: PALETTE.moss, dark: PALETTE.mossDark };
}

function drawBaseHead(
  g: Phaser.GameObjects.Graphics,
  phenotype: PhenotypeBlueprint,
  headX: number,
  headY: number,
  headW: number,
  headH: number,
  bodyColour: number,
): void {
  g.fillStyle(bodyColour, 1);
  g.lineStyle(3, PALETTE.inkDark, 0.95);
  g.fillEllipse(headX, headY, headW, headH);
  g.strokeEllipse(headX, headY, headW, headH);

  if (phenotype.baseAnimalId === 'rabbit') {
    const earScale = phenotype.proportions.earScale;
    g.fillEllipse(headX - 8, headY - (headH * 0.72), 15, 43 * earScale);
    g.strokeEllipse(headX - 8, headY - (headH * 0.72), 15, 43 * earScale);
    g.fillEllipse(headX + 9, headY - (headH * 0.7), 14, 39 * earScale);
    g.strokeEllipse(headX + 9, headY - (headH * 0.7), 14, 39 * earScale);
  } else if (phenotype.baseAnimalId === 'goat') {
    g.fillTriangle(headX - 16, headY - 18, headX - 38, headY - 27, headX - 23, headY - 5);
    g.strokeTriangle(headX - 16, headY - 18, headX - 38, headY - 27, headX - 23, headY - 5);
    g.fillTriangle(headX + 12, headY - 18, headX + 34, headY - 26, headX + 20, headY - 4);
    g.strokeTriangle(headX + 12, headY - 18, headX + 34, headY - 26, headX + 20, headY - 4);
    g.lineStyle(2, PALETTE.inkDark, 0.8);
    g.lineBetween(headX + 7, headY + 18, headX + 3, headY + 35);
    g.lineBetween(headX + 3, headY + 35, headX + 12, headY + 24);
  } else {
    g.fillTriangle(headX - 13, headY - 18, headX - 28, headY - 34, headX - 24, headY - 7);
    g.strokeTriangle(headX - 13, headY - 18, headX - 28, headY - 34, headX - 24, headY - 7);
    g.fillTriangle(headX + 12, headY - 18, headX + 27, headY - 33, headX + 23, headY - 6);
    g.strokeTriangle(headX + 12, headY - 18, headX + 27, headY - 33, headX + 23, headY - 6);
    g.fillEllipse(headX + (headW * 0.37), headY + 5, headW * 0.46, headH * 0.38);
    g.strokeEllipse(headX + (headW * 0.37), headY + 5, headW * 0.46, headH * 0.38);
    g.fillStyle(PALETTE.inkDark, 0.9);
    g.fillCircle(headX + (headW * 0.31), headY + 4, 2.2);
    g.fillCircle(headX + (headW * 0.43), headY + 4, 2.2);
  }
}

function drawHornArray(g: Phaser.GameObjects.Graphics, headX: number, headY: number, horn: PhenotypeComponent): void {
  const spread = 10 + (horn.variant * 9);
  const height = 25 + (horn.strength * 24);
  g.fillStyle(PALETTE.bone, 1);
  g.lineStyle(2, PALETTE.inkDark, 1);
  g.fillTriangle(headX - spread, headY - 17, headX - spread - 7, headY - 17 - height, headX - 2, headY - 21);
  g.strokeTriangle(headX - spread, headY - 17, headX - spread - 7, headY - 17 - height, headX - 2, headY - 21);
  g.fillTriangle(headX + spread, headY - 17, headX + spread + 7, headY - 17 - height, headX + 2, headY - 21);
  g.strokeTriangle(headX + spread, headY - 17, headX + spread + 7, headY - 17 - height, headX + 2, headY - 21);
}

export function drawPhenotypeCreature(
  scene: Phaser.Scene,
  x: number,
  y: number,
  phenotype: PhenotypeBlueprint,
  { scale = 1, flip = false, enemy = false }: PhenotypeRenderOptions = {},
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  container.setScale(scale * phenotype.proportions.scale);
  const g = scene.add.graphics();
  const { body: bodyColour, dark } = baseColours(phenotype, enemy);

  const bodyW = 112 * phenotype.proportions.bodyLength;
  const bodyH = 72 * phenotype.proportions.bodyDepth;
  const legH = 31 * phenotype.proportions.legLength;
  const legW = 20 * phenotype.proportions.legThickness;
  const headW = 52 * phenotype.proportions.headScale;
  const headH = 47 * phenotype.proportions.headScale;
  const headX = (bodyW * 0.43) + 5;
  const headY = -(bodyH * 0.18);

  g.fillStyle(dark, 0.42);
  g.fillEllipse(4, (bodyH * 0.42), bodyW * 1.08, Math.max(18, bodyH * 0.3));

  const reinforcedNeck = component(phenotype, 'reinforced_neck');
  if (reinforcedNeck) {
    g.fillStyle(dark, 0.85);
    g.fillEllipse(bodyW * 0.31, -2, 38 + (reinforcedNeck.strength * 20), bodyH * 0.72);
  }

  g.fillStyle(bodyColour, 1);
  g.lineStyle(3, PALETTE.inkDark, 0.95);
  g.fillEllipse(0, 0, bodyW, bodyH);
  g.strokeEllipse(0, 0, bodyW, bodyH);

  const hindX = -(bodyW * 0.29);
  const foreX = bodyW * 0.25;
  g.fillRoundedRect(hindX - (legW / 2), bodyH * 0.28, legW, legH, Math.min(8, legW * 0.35));
  g.strokeRoundedRect(hindX - (legW / 2), bodyH * 0.28, legW, legH, Math.min(8, legW * 0.35));
  g.fillRoundedRect(foreX - (legW / 2), bodyH * 0.28, legW, legH, Math.min(8, legW * 0.35));
  g.strokeRoundedRect(foreX - (legW / 2), bodyH * 0.28, legW, legH, Math.min(8, legW * 0.35));

  drawBaseHead(g, phenotype, headX, headY, headW, headH, bodyColour);

  const predatoryJaw = component(phenotype, 'predatory_jaw');
  if (predatoryJaw) {
    const jawX = headX + (headW * 0.43);
    const jawW = 19 + (predatoryJaw.strength * 20);
    g.fillStyle(dark, 0.9);
    g.fillRoundedRect(jawX, headY - 1, jawW, 18, 6);
    g.strokeRoundedRect(jawX, headY - 1, jawW, 18, 6);
    g.fillStyle(PALETTE.bone, 1);
    g.fillTriangle(jawX + 8, headY + 15, jawX + 12, headY + 24, jawX + 16, headY + 14);
    g.fillTriangle(jawX + 20, headY + 15, jawX + 24, headY + 23, jawX + 28, headY + 14);
  }

  const horns = component(phenotype, 'horn_array');
  if (horns) drawHornArray(g, headX, headY, horns);

  const heavyBrow = component(phenotype, 'heavy_brow');
  if (heavyBrow) {
    g.lineStyle(5 + (heavyBrow.strength * 4), dark, 0.95);
    g.lineBetween(headX + 4, headY - 14, headX + 20, headY - 11);
  }

  const owlEyes = component(phenotype, 'owl_eye_geometry');
  const independentEyes = component(phenotype, 'independent_tracking');
  const eyeRadius = owlEyes ? 7 + (owlEyes.strength * 4) : 4;
  const eyeX = headX + (headW * 0.2);
  const eyeY = headY - (headH * 0.12);
  g.fillStyle(PALETTE.bone, owlEyes ? 0.95 : 0.25);
  g.fillCircle(eyeX, eyeY, eyeRadius);
  g.lineStyle(2, PALETTE.inkDark, 1);
  g.strokeCircle(eyeX, eyeY, eyeRadius);
  const pupilOffset = independentEyes ? ((independentEyes.variant - 0.5) * eyeRadius) : 0;
  g.fillStyle(PALETTE.inkDark, 1);
  g.fillCircle(eyeX + pupilOffset, eyeY, Math.max(2.5, eyeRadius * 0.35));

  const claws = component(phenotype, 'claws');
  if (claws) {
    const clawY = (bodyH * 0.28) + legH;
    g.fillStyle(PALETTE.bone, 1);
    for (let index = 0; index < 3; index += 1) {
      const clawX = foreX - 8 + (index * 7);
      g.fillTriangle(clawX, clawY - 2, clawX + 4, clawY + 8 + (claws.strength * 5), clawX + 7, clawY - 2);
    }
  }

  const pads = component(phenotype, 'adhesive_pads');
  if (pads) {
    g.fillStyle(PALETTE.acid, 0.72);
    g.fillEllipse(foreX, (bodyH * 0.28) + legH + 2, legW * 1.3, 8 + (pads.strength * 5));
  }

  const regrowth = component(phenotype, 'regrowth_asymmetry');
  if (regrowth) {
    g.lineStyle(3, PALETTE.acid, 0.9);
    g.strokeCircle(hindX, (bodyH * 0.28) + (legH * 0.62), 7 + (regrowth.variant * 5));
  }

  const plateIntensity = surfaceIntensity(phenotype, 'dermal_plates');
  if (plateIntensity > 0) {
    g.fillStyle(PALETTE.bone, 0.72 + (plateIntensity * 0.2));
    g.lineStyle(1, PALETTE.inkDark, 0.75);
    const plateCount = 5 + Math.round(plateIntensity * 4);
    for (let index = 0; index < plateCount; index += 1) {
      const px = -(bodyW * 0.35) + ((bodyW * 0.7) * (index / Math.max(1, plateCount - 1)));
      const py = -(bodyH * 0.38) - ((index % 2) * 3);
      g.fillTriangle(px - 9, py + 7, px, py - 7 - (plateIntensity * 6), px + 10, py + 7);
      g.strokeTriangle(px - 9, py + 7, px, py - 7 - (plateIntensity * 6), px + 10, py + 7);
    }
  }

  const glandIntensity = Math.max(surfaceIntensity(phenotype, 'gland_clusters'), surfaceIntensity(phenotype, 'glandular_texture'));
  if (glandIntensity > 0) {
    g.fillStyle(PALETTE.acid, 0.42 + (glandIntensity * 0.28));
    const count = 5 + Math.round(glandIntensity * 6);
    for (let index = 0; index < count; index += 1) {
      const px = -(bodyW * 0.32) + ((bodyW * 0.64) * ((index + 1) / (count + 1)));
      const py = -8 + (((index % 3) - 1) * 13);
      g.fillCircle(px, py, 3 + ((index % 2) * 2));
    }
  }

  const colourIntensity = surfaceIntensity(phenotype, 'dynamic_colour');
  const patternIntensity = surfaceIntensity(phenotype, 'pattern_zones');
  if (colourIntensity > 0 || patternIntensity > 0) {
    g.lineStyle(4 + (patternIntensity * 5), PALETTE.bruise, 0.4 + (Math.max(colourIntensity, patternIntensity) * 0.35));
    for (let index = -2; index <= 2; index += 1) {
      const px = index * (bodyW * 0.12);
      g.lineBetween(px - 7, -(bodyH * 0.24), px + 7, bodyH * 0.24);
    }
  }

  container.add(g);
  if (flip) container.scaleX *= -1;
  return container;
}
