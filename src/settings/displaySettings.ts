export type DisplaySettings = {
  readonly dimScreen: boolean;
};

const STORAGE_KEY = 'splicepit-display-settings-v1';
const DEFAULT_SETTINGS: DisplaySettings = { dimScreen: false };

function readStoredSettings(): DisplaySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<DisplaySettings>;
    return { dimScreen: parsed.dimScreen === true };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

let currentSettings = readStoredSettings();

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  } catch {
    // Display comfort should never block the game if storage is unavailable.
  }
}

export function getDisplaySettings(): DisplaySettings {
  return { ...currentSettings };
}

export function applyDisplaySettings(): DisplaySettings {
  document.documentElement.classList.toggle('display-dimmed', currentSettings.dimScreen);
  return getDisplaySettings();
}

export function toggleDimScreen(): DisplaySettings {
  currentSettings = { ...currentSettings, dimScreen: !currentSettings.dimScreen };
  persist();
  return applyDisplaySettings();
}

export function fullscreenSupported(): boolean {
  return typeof document !== 'undefined' && typeof document.documentElement.requestFullscreen === 'function';
}

export function isFullscreen(): boolean {
  return typeof document !== 'undefined' && document.fullscreenElement !== null;
}

export async function toggleFullscreen(): Promise<boolean> {
  if (!fullscreenSupported()) return false;
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    return isFullscreen();
  } catch {
    return isFullscreen();
  }
}

applyDisplaySettings();
