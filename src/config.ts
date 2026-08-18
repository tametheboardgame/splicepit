export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
export const TILE = 48;

// WP0.4C prototype presentation palette: bright pastoral surfaces with
// deliberately wrong biotech accents. Final production metrics/assets remain
// owned by R0.6.
export const PALETTE = {
  ink: 0x392c35,
  inkDark: 0x241927,
  paper: 0xfff2bd,
  paperDeep: 0x79d4e8,
  moss: 0x62c85b,
  mossDark: 0x2f8f4e,
  bruise: 0x9a63c7,
  bruiseDark: 0x5a365f,
  rust: 0xf06a4f,
  rustDark: 0xa34246,
  acid: 0xd8f64b,
  bone: 0xffe4a3,
  blood: 0xd93f63,
  blueGrey: 0x3ba7b8,
  sky: 0x79d4e8,
  grass: 0x8fd25f,
  grassLight: 0xc2ec79,
  candy: 0xff78ad,
  yolk: 0xffc94d,
  grape: 0x73439a,
} as const;

export const TEXT = {
  title: {
    fontFamily: '"Arial Rounded MT Bold", "Trebuchet MS", Arial, sans-serif',
    color: '#392c35',
    fontStyle: 'bold',
  },
  body: {
    fontFamily: '"Trebuchet MS", Verdana, Arial, sans-serif',
    color: '#392c35',
  },
  mono: {
    fontFamily: 'Verdana, "Trebuchet MS", Arial, sans-serif',
    color: '#5a365f',
    fontStyle: 'bold',
  },
} as const;
