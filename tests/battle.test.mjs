import test from 'node:test';
import assert from 'node:assert/strict';
import { createCombatant, resolveAttack, resolveTrait } from '../src/systems/battleSystem.js';

test('attack deals at least one damage', () => {
  const a=createCombatant({name:'A',stats:{maxHp:20,attack:6,defence:2,speed:3},genes:[]});
  const b=createCombatant({name:'B',stats:{maxHp:20,attack:3,defence:99,speed:3},genes:[]});
  resolveAttack(a,b,{},()=>0.5);
  assert.equal(b.hp,19);
});

test('regeneration trait heals without exceeding max hp', () => {
  const a=createCombatant({name:'A',stats:{maxHp:20,attack:6,defence:2,speed:3},genes:['gecko_regeneration']});
  const b=createCombatant({name:'B',stats:{maxHp:20,attack:3,defence:2,speed:3},genes:[]});
  a.hp=17; resolveTrait(a,b,()=>0.5);
  assert.equal(a.hp,20);
});
