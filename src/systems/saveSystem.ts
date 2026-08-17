import { gameState } from '../state/GameState.js';
import type { GameStateSnapshot } from '../types.js';

const SAVE_KEY = 'splicepit-r0-save';

export function saveGame(): boolean {
  if (typeof localStorage === 'undefined') return false;
  localStorage.setItem(SAVE_KEY, JSON.stringify(gameState.snapshot()));
  return true;
}

export function loadGame(): boolean {
  if (typeof localStorage === 'undefined') return false;
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  try {
    gameState.hydrate(JSON.parse(raw) as Partial<GameStateSnapshot>);
    return true;
  } catch {
    return false;
  }
}

export function clearSave(): void {
  if (typeof localStorage !== 'undefined') localStorage.removeItem(SAVE_KEY);
  gameState.reset();
}

export function hasSave(): boolean {
  return typeof localStorage !== 'undefined' && Boolean(localStorage.getItem(SAVE_KEY));
}
