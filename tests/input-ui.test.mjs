import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ACTIONS, DEFAULT_BINDINGS, keyboardHint } from '../src/input/actions.js';
import { availableLocales, t } from '../src/localisation/strings.js';
import { getDialogueDefinition, dialogueText } from '../src/dialogue/catalogue.js';

test('semantic action catalogue covers movement, interaction, menus, lab and battle', () => {
  assert.equal(ACTIONS.MOVE_UP, 'MOVE_UP');
  assert.equal(ACTIONS.INTERACT, 'INTERACT');
  assert.equal(ACTIONS.CONFIRM, 'CONFIRM');
  assert.equal(ACTIONS.CANCEL, 'CANCEL');
  assert.equal(ACTIONS.MENU, 'MENU');
  assert.equal(ACTIONS.LAB_INTERACT, 'LAB_INTERACT');
  assert.equal(ACTIONS.BATTLE_PRIMARY, 'BATTLE_PRIMARY');
  assert.equal(ACTIONS.BATTLE_SECONDARY, 'BATTLE_SECONDARY');
  assert.equal(ACTIONS.BATTLE_TERTIARY, 'BATTLE_TERTIARY');
  assert.deepEqual(DEFAULT_BINDINGS.keyboard.MOVE_UP, ['ArrowUp', 'KeyW']);
  assert.equal(keyboardHint(ACTIONS.LAB_INTERACT), 'E/SPACE');
  assert.ok(DEFAULT_BINDINGS.gamepad);
  assert.ok(DEFAULT_BINDINGS.touch);
});

test('localisation catalogue supports IDs, interpolation and locale enumeration', () => {
  assert.deepEqual(availableLocales(), ['en-GB']);
  assert.equal(t('lab.prompt.interact', { control: 'E', name: 'ANIMAL PEN' }), '[E] ANIMAL PEN');
  assert.equal(t('battle.hp', { current: 8, maximum: 12 }), 'HP 8/12');
});

test('dialogue definitions resolve through string IDs and retain future audio slot', () => {
  const definition = getDialogueDefinition('intro_aftermath');
  assert.equal(definition.id, 'intro_aftermath');
  assert.equal(definition.textId, 'intro.body');
  assert.equal(definition.audioRef, undefined);
  assert.match(dialogueText('lab_notice_board', { debt: 860 }), /£860/);
});

test('playable scenes do not own physical keyboard bindings or direct transitions', () => {
  const scenes = ['BootScene.ts', 'TitleScene.ts', 'IntroScene.ts', 'LabScene.ts', 'SpliceScene.ts', 'BattleScene.ts'];
  for (const file of scenes) {
    const source = readFileSync(`src/scenes/${file}`, 'utf8');
    assert.doesNotMatch(source, /KeyCodes\./, `${file} must not reference physical key codes`);
    assert.doesNotMatch(source, /input\.keyboard/, `${file} must not bind the keyboard directly`);
    assert.doesNotMatch(source, /scene\.start\(/, `${file} must use the shared transition framework`);
  }
});
