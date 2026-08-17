import { decodeSave, encodeSave, type SaveEnvelopeV2 } from './saveSchema.js';

export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void; }

export const SAVE_KEYS = {
  primary: 'splicepit-save', backup: 'splicepit-save-backup', staging: 'splicepit-save-staging', corrupt: 'splicepit-save-corrupt',
  legacyR01: 'splicepit-r0-save', legacyR01Archive: 'splicepit-r0-save-archive', settings: 'splicepit-settings',
} as const;

export type SaveReadResult = { envelope: SaveEnvelopeV2; source: 'primary' | 'backup' };

function tryDecode(raw: string | null): SaveEnvelopeV2 | null { if (!raw) return null; try { return decodeSave(raw); } catch { return null; } }

export function archiveLegacyR01Save(storage: StorageLike): boolean {
  const legacy = storage.getItem(SAVE_KEYS.legacyR01);
  if (!legacy) return false;
  try {
    const archived = storage.getItem(SAVE_KEYS.legacyR01Archive);
    if (archived === null) storage.setItem(SAVE_KEYS.legacyR01Archive, legacy);
    if (storage.getItem(SAVE_KEYS.legacyR01Archive) === legacy) storage.removeItem(SAVE_KEYS.legacyR01);
    return storage.getItem(SAVE_KEYS.legacyR01) === null;
  } catch { return false; }
}

export function readSave(storage: StorageLike): SaveReadResult | null {
  const primary = tryDecode(storage.getItem(SAVE_KEYS.primary));
  if (primary) return { envelope: primary, source: 'primary' };
  const backup = tryDecode(storage.getItem(SAVE_KEYS.backup));
  return backup ? { envelope: backup, source: 'backup' } : null;
}

export function hasReadableSave(storage: StorageLike): boolean { return readSave(storage) !== null; }

export function writeSave(storage: StorageLike, envelope: SaveEnvelopeV2): boolean {
  const encoded = encodeSave(envelope);
  try {
    storage.setItem(SAVE_KEYS.staging, encoded);
    const stagedRaw = storage.getItem(SAVE_KEYS.staging);
    if (!stagedRaw) throw new Error('Staged save could not be read back');
    decodeSave(stagedRaw);

    const previousRaw = storage.getItem(SAVE_KEYS.primary);
    if (previousRaw) {
      if (tryDecode(previousRaw)) storage.setItem(SAVE_KEYS.backup, previousRaw);
      else if (storage.getItem(SAVE_KEYS.corrupt) === null) storage.setItem(SAVE_KEYS.corrupt, previousRaw);
    }

    storage.setItem(SAVE_KEYS.primary, stagedRaw);
    decodeSave(storage.getItem(SAVE_KEYS.primary) ?? '');
    storage.removeItem(SAVE_KEYS.staging);
    return true;
  } catch {
    try { storage.removeItem(SAVE_KEYS.staging); } catch { /* leave readable primary/backup untouched */ }
    return false;
  }
}

export function clearPersistedSave(storage: StorageLike): void {
  for (const key of [SAVE_KEYS.primary, SAVE_KEYS.backup, SAVE_KEYS.staging, SAVE_KEYS.corrupt]) {
    try { storage.removeItem(key); } catch { /* best effort */ }
  }
}

export type SettingValue = string | number | boolean;
export interface SettingsEnvelopeV1 { schemaVersion: 1; values: Record<string, SettingValue>; }

export function writeSettings(storage: StorageLike, values: Record<string, SettingValue>): boolean {
  try { storage.setItem(SAVE_KEYS.settings, JSON.stringify({ schemaVersion: 1, values } satisfies SettingsEnvelopeV1)); return true; } catch { return false; }
}

export function readSettings(storage: StorageLike): Record<string, SettingValue> {
  const raw = storage.getItem(SAVE_KEYS.settings); if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown; if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const record = parsed as Record<string, unknown>; if (record.schemaVersion !== 1 || typeof record.values !== 'object' || record.values === null || Array.isArray(record.values)) return {};
    const values: Record<string, SettingValue> = {};
    for (const [key, value] of Object.entries(record.values as Record<string, unknown>)) if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') values[key] = value;
    return values;
  } catch { return {}; }
}
