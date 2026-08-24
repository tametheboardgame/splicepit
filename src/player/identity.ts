import { isProtagonistId, type ProtagonistId } from './protagonists.js';

export const PLAYER_NAME_MAX_LENGTH = 24;

export interface PlayerIdentity {
  avatarId: ProtagonistId;
  playerName: string;
}

export function normalisePlayerName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalised = value.trim().replace(/\s+/g, ' ');
  if (normalised.length === 0 || normalised.length > PLAYER_NAME_MAX_LENGTH) return null;
  return normalised;
}

export function normalisePlayerIdentity(avatarId: unknown, playerName: unknown): PlayerIdentity | null {
  if (typeof avatarId !== 'string' || !isProtagonistId(avatarId)) return null;
  const normalisedName = normalisePlayerName(playerName);
  return normalisedName ? { avatarId, playerName: normalisedName } : null;
}
