export type EnvironmentMaterialId =
  | 'wood'
  | 'brick'
  | 'plaster'
  | 'steel'
  | 'glass'
  | 'dirt'
  | 'grass'
  | 'cage'
  | 'machinery'
  | 'biological-residue';

export interface EnvironmentMaterialPalette {
  readonly base: string;
  readonly highlight: string;
  readonly shadow: string;
  readonly accent?: string;
}

export interface EnvironmentMaterialContract {
  readonly bright: EnvironmentMaterialPalette;
  readonly dark: EnvironmentMaterialPalette;
}

export const ENVIRONMENT_MATERIALS: Readonly<Record<EnvironmentMaterialId, EnvironmentMaterialContract>> = {
  wood: {
    bright: { base: '#8f6846', highlight: '#b68957', shadow: '#634a36' },
    dark: { base: '#594538', highlight: '#766050', shadow: '#302a28', accent: '#6f3436' },
  },
  brick: {
    bright: { base: '#a65f4f', highlight: '#c47a62', shadow: '#74473e' },
    dark: { base: '#633f3f', highlight: '#7f5350', shadow: '#352d31', accent: '#6c2f35' },
  },
  plaster: {
    bright: { base: '#ead59e', highlight: '#f3e3b9', shadow: '#a98c5d' },
    dark: { base: '#81765f', highlight: '#a09372', shadow: '#48443e', accent: '#594144' },
  },
  steel: {
    bright: { base: '#7f8174', highlight: '#a8aa91', shadow: '#585f56' },
    dark: { base: '#4a504d', highlight: '#6a7169', shadow: '#292f30', accent: '#743e32' },
  },
  glass: {
    bright: { base: '#9fc7bb', highlight: '#c7e0c8', shadow: '#477d82' },
    dark: { base: '#587873', highlight: '#79958a', shadow: '#2d4447', accent: '#6a4c57' },
  },
  dirt: {
    bright: { base: '#c7a66d', highlight: '#d5bb82', shadow: '#a98758' },
    dark: { base: '#6d5c49', highlight: '#88725a', shadow: '#3d3834', accent: '#593534' },
  },
  grass: {
    bright: { base: '#8fb562', highlight: '#a4c873', shadow: '#5f7f47' },
    dark: { base: '#58634a', highlight: '#6c7656', shadow: '#343c35', accent: '#594044' },
  },
  cage: {
    bright: { base: '#9b754d', highlight: '#b68957', shadow: '#664e38' },
    dark: { base: '#5c5145', highlight: '#746458', shadow: '#302e2d', accent: '#743e32' },
  },
  machinery: {
    bright: { base: '#4b8b81', highlight: '#7eaaa0', shadow: '#315f5b', accent: '#e2bd5d' },
    dark: { base: '#425d59', highlight: '#5e756e', shadow: '#263b3b', accent: '#8b4a43' },
  },
  'biological-residue': {
    bright: { base: '#9cc86d', highlight: '#b6d978', shadow: '#5c8752', accent: '#c97c86' },
    dark: { base: '#5e6e4d', highlight: '#78855b', shadow: '#343d35', accent: '#7d3944' },
  },
} as const;

export const ENVIRONMENT_DEPTH = {
  contactShadowFill: 'rgba(37,54,47,0.29)',
  structuralShadowOffsetX: 4,
  structuralShadowOffsetY: 6,
  foregroundOcclusionRule: 'foreground silhouettes may occlude the protagonist only when depth is spatially credible',
  outlineRule: 'use crisp pixel edges and local material contrast before relying on heavy outlines',
} as const;

export const ENVIRONMENT_SURFACE_RULES = {
  grime: 'edge-biased and traffic-aware; avoid uniform dark overlays',
  rust: 'attach to exposed metal joins, fasteners, scratches and runoff paths',
  damp: 'follow drains, wall bases, roof failures and low points rather than random speckling',
  blood: 'author stains as physical residue with age/cleanup context; never use as a full-scene tint',
  biologicalResidue: 'connect growth, tissue or slime to plausible failed containment, leakage or disposal points',
  damagedSurfaces: 'preserve readable material identity while adding chips, patches, warping and repair history',
  animation: 'small environmental motion must reinforce material or machinery behaviour and remain subordinate to navigation',
} as const;

export function drawPixelRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
): void {
  ctx.fillStyle = fill;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

export function drawEnvironmentContactShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radiusX = 22,
  radiusY = 7,
): void {
  ctx.save();
  ctx.fillStyle = ENVIRONMENT_DEPTH.contactShadowFill;
  ctx.beginPath();
  ctx.ellipse(Math.round(x), Math.round(y), radiusX, radiusY, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
