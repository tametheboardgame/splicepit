import test from 'node:test';
import assert from 'node:assert/strict';
import { EMPTY_DOMAIN_STATE } from '../src/state/DomainState.js';
import { gameState } from '../src/state/GameState.js';
import { createSaveEnvelope, decodeSave } from '../src/persistence/saveSchema.js';
import { normalisePlayerIdentity, normalisePlayerName, PLAYER_NAME_MAX_LENGTH } from '../src/player/identity.js';

function reset() {
  gameState.reset();
}

test('WP0.4E player names are trimmed, compacted and bounded', () => {
  assert.equal(normalisePlayerName('  Dr   Wasp  '), 'Dr Wasp');
  assert.equal(normalisePlayerName('   '), null);
  assert.equal(normalisePlayerName('x'.repeat(PLAYER_NAME_MAX_LENGTH + 1)), null);
  assert.deepEqual(normalisePlayerIdentity('ada', ' Rook '), { avatarId: 'ada', playerName: 'Rook' });
  assert.equal(normalisePlayerIdentity('unknown', 'Rook'), null);
});

test('WP0.4E identity survives the normal save envelope round trip', () => {
  reset();
  assert.equal(gameState.setPlayerIdentity('pip', 'Moss'), true);
  const envelope = createSaveEnvelope(gameState.snapshot(), EMPTY_DOMAIN_STATE, '2026-08-24T13:00:00.000Z');
  const decoded = decodeSave(JSON.stringify(envelope));

  assert.equal(decoded.payload.gameplay.avatarId, 'pip');
  assert.equal(decoded.payload.gameplay.playerName, 'Moss');

  reset();
  gameState.hydrate(decoded.payload.gameplay);
  assert.equal(gameState.avatarId, 'pip');
  assert.equal(gameState.playerName, 'Moss');
  reset();
});

test('legacy saves with no identity hydrate safely and malformed identity is discarded', () => {
  reset();
  const legacyGameplay = { ...gameState.snapshot() };
  delete legacyGameplay.avatarId;
  delete legacyGameplay.playerName;
  gameState.hydrate(legacyGameplay);
  assert.equal(gameState.avatarId, null);
  assert.equal(gameState.playerName, null);

  gameState.hydrate({ ...gameState.snapshot(), avatarId: 'not-a-protagonist', playerName: 'Bad Data' });
  assert.equal(gameState.avatarId, null);
  assert.equal(gameState.playerName, null);
  reset();
});
