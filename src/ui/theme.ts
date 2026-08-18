import type Phaser from 'phaser';

export const UI_COLOURS = {
  void: 0x0d0f0e,
  panel: 0x151917,
  panelRaised: 0x1d211e,
  panelInset: 0x0f1210,
  borderDark: 0x080a09,
  border: 0x535a52,
  borderLight: 0x788074,
  text: 0xe3dcc7,
  muted: 0x9b9587,
  disabled: 0x625f57,
  greenDark: 0x355530,
  green: 0x77a94f,
  greenBright: 0xb3d867,
  amberDark: 0x744021,
  amber: 0xe19a43,
  copper: 0xa6673f,
  red: 0x8d3d37,
  redBright: 0xb64d3d,
  cyan: 0x619a94,
  bruise: 0x745472,
} as const;

export const UI_METRICS = {
  unit: 4,
  spaceXs: 4,
  spaceSm: 8,
  spaceMd: 12,
  spaceLg: 16,
  spaceXl: 24,
  border: 1,
  borderStrong: 2,
  panelInset: 4,
  buttonHeight: 34,
  promptHeight: 26,
  slot: 42,
  radius: 2,
  safeEdge: 12,
} as const;

const fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const UI_TEXT = {
  micro: { fontFamily, fontSize: '8px', color: '#9b9587' },
  label: { fontFamily, fontSize: '9px', color: '#b3d867', fontStyle: 'bold' },
  body: { fontFamily, fontSize: '12px', color: '#e3dcc7' },
  bodySmall: { fontFamily, fontSize: '10px', color: '#e3dcc7' },
  heading: { fontFamily, fontSize: '14px', color: '#e3dcc7', fontStyle: 'bold' },
  title: { fontFamily, fontSize: '18px', color: '#e3dcc7', fontStyle: 'bold' },
  number: { fontFamily, fontSize: '11px', color: '#e3dcc7', fontStyle: 'bold' },
} satisfies Record<string, Phaser.Types.GameObjects.Text.TextStyle>;

export type UiAccent = 'green' | 'amber' | 'red' | 'cyan' | 'bruise';

export function accentColour(accent: UiAccent): number {
  if (accent === 'amber') return UI_COLOURS.amber;
  if (accent === 'red') return UI_COLOURS.redBright;
  if (accent === 'cyan') return UI_COLOURS.cyan;
  if (accent === 'bruise') return UI_COLOURS.bruise;
  return UI_COLOURS.greenBright;
}
