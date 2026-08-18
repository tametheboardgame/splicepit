import Phaser from 'phaser';

const PROTOTYPE_COLOUR_REMAP = new Map<number, number>([
  [0x0f110e, 0x8fd25f],
  [0x24231f, 0x4e9a55],
  [0x171713, 0x39794b],
  [0x252a22, 0xb9e878],
  [0x171611, 0x5a365f],
  [0x151711, 0x395d68],
  [0x2c2119, 0xd88445],
  [0x0a0b09, 0x392c35],
  [0x0b0b09, 0x392c35],
  [0x0c0c0b, 0x392c35],
]);

let installed = false;

function remap(colour: number | undefined): number | undefined {
  if (colour === undefined) return undefined;
  return PROTOTYPE_COLOUR_REMAP.get(colour) ?? colour;
}

/**
 * WP0.4C prototype-only bridge.
 *
 * Several R0.1/R0.3 scenes still contain hard-coded near-black development
 * colours. Re-authoring every scene before the production art pipeline would
 * create a large, disposable diff, so this maps only those known prototype
 * neutrals at the Phaser Graphics boundary. Production presentation work in
 * R0.6 replaces this bridge with authored assets and final scene styling.
 */
export function installPrototypeColourRemap(): void {
  if (installed) return;
  installed = true;

  const prototype = Phaser.GameObjects.Graphics.prototype as unknown as {
    fillStyle: (this: Phaser.GameObjects.Graphics, colour: number, alpha?: number) => Phaser.GameObjects.Graphics;
    lineStyle: (this: Phaser.GameObjects.Graphics, lineWidth: number, colour?: number, alpha?: number) => Phaser.GameObjects.Graphics;
  };

  const originalFillStyle = prototype.fillStyle;
  const originalLineStyle = prototype.lineStyle;

  prototype.fillStyle = function fillStyle(colour: number, alpha?: number): Phaser.GameObjects.Graphics {
    return originalFillStyle.call(this, remap(colour) ?? colour, alpha);
  };

  prototype.lineStyle = function lineStyle(lineWidth: number, colour?: number, alpha?: number): Phaser.GameObjects.Graphics {
    return originalLineStyle.call(this, lineWidth, remap(colour), alpha);
  };
}
