export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const TILE = 48;

export const PALETTE = {
  ink: 0xe8dfc8,
  inkDark: 0x302a23,
  paper: 0x27221c,
  paperDeep: 0x181512,
  moss: 0x71845c,
  mossDark: 0x3e4b34,
  bruise: 0x73516f,
  bruiseDark: 0x3f2d3c,
  rust: 0xa0573d,
  rustDark: 0x5e3327,
  acid: 0xb7c86c,
  bone: 0xd1c6aa,
  blood: 0x793a36,
  blueGrey: 0x657779,
} as const;

export const TEXT = {
  title: { fontFamily: 'Georgia, serif', color: '#e8dfc8' },
  body: { fontFamily: 'Georgia, serif', color: '#e8dfc8' },
  mono: { fontFamily: 'ui-monospace, monospace', color: '#a79d88' },
} as const;
