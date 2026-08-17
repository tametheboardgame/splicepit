import { createSaveEnvelope, domainStateFromSave } from '../persistence/saveSchema.js';
import { archiveLegacyR01Save, clearPersistedSave, hasReadableSave, readSave, writeSave } from '../persistence/storage.js';
import { domainState } from '../state/DomainState.js';
import { gameState } from '../state/GameState.js';

function browserStorage(): Storage | null { return typeof localStorage === 'undefined' ? null : localStorage; }

export function saveGame(): boolean {
  const storage = browserStorage();
  if (!storage) return false;
  archiveLegacyR01Save(storage);
  return writeSave(storage, createSaveEnvelope(gameState.snapshot(), domainState.snapshot()));
}

export function loadGame(): boolean {
  const storage = browserStorage();
  if (!storage) return false;
  archiveLegacyR01Save(storage);
  const loaded = readSave(storage);
  if (!loaded) return false;
  gameState.hydrate(loaded.envelope.payload.gameplay);
  domainState.hydrate(domainStateFromSave(loaded.envelope));
  if (loaded.source === 'backup') writeSave(storage, loaded.envelope);
  return true;
}

export function clearSave(): void {
  const storage = browserStorage();
  if (storage) {
    archiveLegacyR01Save(storage);
    clearPersistedSave(storage);
  }
  gameState.reset();
  domainState.reset();
}

export function hasSave(): boolean {
  const storage = browserStorage();
  if (!storage) return false;
  archiveLegacyR01Save(storage);
  return hasReadableSave(storage);
}
