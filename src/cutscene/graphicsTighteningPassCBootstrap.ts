type PassCBootstrapGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: { ready?: boolean };
  __SPLICEPIT_GRAPHICS_PASS_C_BOOTSTRAP__?: {
    ready: true;
    loaded: boolean;
  };
};

const global = globalThis as PassCBootstrapGlobal;
const debug = { ready: true as const, loaded: false };
global.__SPLICEPIT_GRAPHICS_PASS_C_BOOTSTRAP__ = debug;

let loading = false;

function loadWhenGameplayExists(): void {
  if (debug.loaded || loading) return;
  if (!global.__SPLICEPIT_VISUAL_RESET__) {
    window.setTimeout(loadWhenGameplayExists, 40);
    return;
  }

  loading = true;
  void import('./graphicsTighteningPassCAssetRuntime.js')
    .then(() => {
      debug.loaded = true;
    })
    .catch((error: unknown) => {
      loading = false;
      console.error('Pass C hero-art runtime failed to load', error);
      window.setTimeout(loadWhenGameplayExists, 120);
    });
}

loadWhenGameplayExists();

export {};
