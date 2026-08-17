import test from 'node:test';
import assert from 'node:assert/strict';
import { ids } from '../src/domain/ids.js';
import { emptyArenaCapabilities } from '../src/domain/model.js';
import { createSaveEnvelope, decodeSave, domainStateFromSave, SAVE_SCHEMA_VERSION } from '../src/persistence/saveSchema.js';
import {
  SAVE_KEYS,
  archiveLegacyR01Save,
  clearPersistedSave,
  readSave,
  readSettings,
  writeSave,
  writeSettings,
} from '../src/persistence/storage.js';

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

function gameplayFixture(overrides = {}) {
  return {
    hasBaseAnimal: true,
    baseAnimalId: 'rabbit',
    collectedGenes: ['gecko_regeneration'],
    currentCreature: null,
    coins: 42,
    debt: 830,
    fitPitWins: 1,
    questStage: 'fight',
    seenIntro: true,
    ...overrides,
  };
}

function domainFixture() {
  const creatureId = ids.creature('creature_mabel');
  const landCapabilityId = ids.capability('arena_land_function');
  const arenaCapabilities = emptyArenaCapabilities();
  arenaCapabilities.land = { functional: true, supportingCapabilityIds: [landCapabilityId] };

  return {
    creatures: [{
      id: creatureId,
      name: 'Mabel',
      baseAnimalId: ids.baseAnimal('rabbit'),
      role: 'main',
      createdAt: '2026-08-17T10:00:00.000Z',
      estimatedAgeDays: 420,
      phenotypeSeed: 'phenotype-seed-mabel',
      spliceHistory: [{
        id: ids.spliceAttempt('splice_001'),
        sequence: 1,
        attemptedAt: '2026-08-17T10:05:00.000Z',
        sourcePackageIds: [ids.sourcePackage('gecko_regeneration')],
        consumedMaterialLotIds: [ids.materialLot('material_gecko_001')],
        outcomeBand: 'normal_success',
        expressions: [],
      }],
      mutations: [],
      injuries: [{ id: 'injury_001', recordedAt: '2026-08-17T10:10:00.000Z', status: 'healed', notes: 'Representative save fixture.' }],
      training: [{ id: 'training_001', recordedAt: '2026-08-17T10:15:00.000Z', capabilityId: landCapabilityId, notes: 'Representative save fixture.' }],
      capabilityIds: [landCapabilityId],
      arenaCapabilities,
    }],
    mainCreatureIds: [creatureId],
    testAnimalIds: [],
    materialStock: [{
      id: ids.materialLot('material_gecko_001'),
      sourcePackageId: ids.sourcePackage('gecko_regeneration'),
      quantity: 2,
      acquiredAt: '2026-08-17T09:30:00.000Z',
      notes: 'Physical stock persists independently from knowledge.',
    }],
    researchKnowledge: [{
      sourcePackageId: ids.sourcePackage('gecko_regeneration'),
      baseAnimalId: ids.baseAnimal('rabbit'),
      observationCount: 3,
      notes: ['Knowledge persists without creating physical stock.'],
    }],
    progression: {
      activeStateIds: [ids.progressionState('fight')],
      activeQuestIds: [ids.quest('r0_1_slice')],
      completedQuestIds: [],
    },
  };
}

test('current R0.2 save schema round-trips gameplay and persistent biological state', () => {
  const gameplay = gameplayFixture();
  const domain = domainFixture();
  const envelope = createSaveEnvelope(gameplay, domain, '2026-08-17T12:00:00.000Z');
  const decoded = decodeSave(JSON.stringify(envelope));

  assert.equal(decoded.schemaVersion, SAVE_SCHEMA_VERSION);
  assert.deepEqual(decoded.payload.gameplay, gameplay);
  assert.deepEqual(domainStateFromSave(decoded), domain);
  assert.equal(decoded.payload.creatures.records[0].phenotypeSeed, 'phenotype-seed-mabel');
  assert.equal(decoded.payload.creatures.records[0].spliceHistory[0].sequence, 1);
  assert.equal(decoded.payload.materials.stock[0].quantity, 2);
  assert.equal(decoded.payload.research.knowledge[0].observationCount, 3);
});

test('historical versioned fixture migrates through the save pipeline', () => {
  const gameplay = gameplayFixture();
  const domain = domainFixture();
  const historical = {
    format: 'splicepit-save',
    schemaVersion: 0,
    gameVersion: '0.2.0-dev',
    savedAt: '2026-08-17T11:00:00.000Z',
    payload: { gameplay, domain },
  };

  const migrated = decodeSave(JSON.stringify(historical));
  assert.equal(migrated.schemaVersion, 1);
  assert.deepEqual(migrated.payload.gameplay, gameplay);
  assert.deepEqual(domainStateFromSave(migrated), domain);
});

test('failed primary decode falls back to the last readable backup without destroying it', () => {
  const storage = new MemoryStorage();
  const first = createSaveEnvelope(gameplayFixture({ coins: 42 }), domainFixture(), '2026-08-17T12:00:00.000Z');
  const second = createSaveEnvelope(gameplayFixture({ coins: 50 }), domainFixture(), '2026-08-17T12:01:00.000Z');

  assert.equal(writeSave(storage, first), true);
  const firstRaw = storage.getItem(SAVE_KEYS.primary);
  assert.equal(writeSave(storage, second), true);
  assert.equal(storage.getItem(SAVE_KEYS.backup), firstRaw);

  storage.setItem(SAVE_KEYS.primary, '{ definitely not valid JSON');
  const recovered = readSave(storage);
  assert.equal(recovered.source, 'backup');
  assert.equal(recovered.envelope.payload.gameplay.coins, 42);
  assert.equal(storage.getItem(SAVE_KEYS.backup), firstRaw);
});

test('R0.1 prototype save is archived before reset rather than silently discarded or permanently migrated', () => {
  const storage = new MemoryStorage();
  const legacyRaw = JSON.stringify(gameplayFixture());
  storage.setItem(SAVE_KEYS.legacyR01, legacyRaw);

  assert.equal(archiveLegacyR01Save(storage), true);
  assert.equal(storage.getItem(SAVE_KEYS.legacyR01), null);
  assert.equal(storage.getItem(SAVE_KEYS.legacyR01Archive), legacyRaw);
});

test('settings are stored separately and survive clearing game saves', () => {
  const storage = new MemoryStorage();
  const envelope = createSaveEnvelope(gameplayFixture(), domainFixture(), '2026-08-17T12:00:00.000Z');
  assert.equal(writeSave(storage, envelope), true);
  assert.equal(writeSettings(storage, { masterVolume: 0.8, reducedMotion: true, locale: 'en-GB' }), true);

  clearPersistedSave(storage);
  assert.equal(readSave(storage), null);
  assert.deepEqual(readSettings(storage), { masterVolume: 0.8, reducedMotion: true, locale: 'en-GB' });
});

test('future incompatible schemas are rejected without mutating the source data', () => {
  const current = createSaveEnvelope(gameplayFixture(), domainFixture(), '2026-08-17T12:00:00.000Z');
  const futureRaw = JSON.stringify({ ...current, schemaVersion: SAVE_SCHEMA_VERSION + 10 });
  assert.throws(() => decodeSave(futureRaw));
  assert.equal(JSON.parse(futureRaw).schemaVersion, SAVE_SCHEMA_VERSION + 10);
});
