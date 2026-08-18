export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const TILE = 48;

export const PALETTE = {
  ink: 0xe3dcc7,
  inkDark: 0x111411,
  paper: 0x1a1e1b,
  paperDeep: 0x0d0f0e,
  moss: 0x77a94f,
  mossDark: 0x355530,
  bruise: 0x745472,
  bruiseDark: 0x3f2d3c,
  rust: 0xa6673f,
  rustDark: 0x5e3327,
  amber: 0xe19a43,
  acid: 0xb3d867,
  bone: 0xc8bca2,
  blood: 0x8d3d37,
  blueGrey: 0x619a94,
  metal: 0x535a52,
  metalLight: 0x788074,
} as const;

const pixelUiFamily = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

export const TEXT = {
  title: { fontFamily: pixelUiFamily, color: '#e3dcc7', fontStyle: 'bold' },
  body: { fontFamily: pixelUiFamily, color: '#e3dcc7' },
  mono: { fontFamily: pixelUiFamily, color: '#9b9587' },
} as const;
