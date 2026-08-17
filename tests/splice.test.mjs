import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSplice, attemptSplice } from '../src/systems/spliceSystem.js';

test('additional gene complexity reduces viability', () => {
  const simple = calculateSplice('rabbit', ['moth_sense']);
  const complex = calculateSplice('rabbit', ['moth_sense','gecko_regeneration','boar_muscle']);
  assert.ok(simple.chance > complex.chance);
});

test('successful splice derives stats and stores genes', () => {
  const values=[0.01,0.99]; let i=0;
  const result=attemptSplice('rabbit',['boar_muscle'],()=>values[i++]);
  assert.equal(result.success,true);
  assert.deepEqual(result.creature.genes,['boar_muscle']);
  assert.ok(result.creature.stats.attack > 6);
});

test('failed splice does not emit a creature', () => {
  const result=attemptSplice('rabbit',['boar_muscle','gecko_regeneration','moth_sense'],()=>0.99);
  assert.equal(result.success,false);
  assert.equal(result.creature,undefined);
});
