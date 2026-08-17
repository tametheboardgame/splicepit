import { gameState } from '../state/GameState.js';

const SAVE_KEY = 'splicepit-r0-save';

export function saveGame() {
  if (typeof localStorage === 'undefined') return false;
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.snapshot()));
  return true;
}

export function loadGame() {
  if (typeof localStorage === 'undefined') return false;
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    gameState.hydrate(JSON.parse(raw));
    return true;
  } catch {
    return false;
  }
}

export function clearSave() {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(SAVE_KEY);
  gameState.reset();
}

export function hasSave() {
  return typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(SAVE_KEY));
}
