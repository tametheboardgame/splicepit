import test from 'node:test';
import assert from 'node:assert/strict';

import {
  firstEnabledMenuIndex,
  MAIN_MENU_ITEMS,
  mainMenuHitTest,
  moveMainMenuSelection,
  moveSettingsSelection,
  SETTINGS_ITEM_IDS,
  settingsBackHitTest,
  settingsHitTest,
} from '../src/ui/mainMenu.js';

test('main menu exposes the required WP0.5B entries with Continue disabled', () => {
  assert.deepEqual(
    MAIN_MENU_ITEMS.map(({ id, enabled }) => ({ id, enabled })),
    [
      { id: 'new-game', enabled: true },
      { id: 'continue', enabled: false },
      { id: 'settings', enabled: true },
    ],
  );
  assert.equal(firstEnabledMenuIndex(), 0);
});

test('keyboard selection skips disabled Continue in both directions', () => {
  assert.equal(moveMainMenuSelection(0, 1), 2);
  assert.equal(moveMainMenuSelection(2, 1), 0);
  assert.equal(moveMainMenuSelection(2, -1), 0);
  assert.equal(moveMainMenuSelection(0, -1), 2);
  assert.equal(moveMainMenuSelection(1, 1), 2);
  assert.equal(moveMainMenuSelection(1, -1), 0);
});

test('pointer hit testing preserves disabled Continue as a visible entry', () => {
  assert.equal(mainMenuHitTest(640, 376), 0);
  assert.equal(mainMenuHitTest(640, 456), 1);
  assert.equal(mainMenuHitTest(640, 536), 2);
  assert.equal(mainMenuHitTest(300, 300), null);
});

test('settings expose dim screen, fullscreen and back with keyboard/pointer navigation', () => {
  assert.deepEqual(SETTINGS_ITEM_IDS, ['dim-screen', 'fullscreen', 'back']);
  assert.equal(settingsHitTest(640, 412), 0);
  assert.equal(settingsHitTest(640, 480), 1);
  assert.equal(settingsHitTest(640, 544), 2);
  assert.equal(settingsHitTest(420, 544), null);
  assert.equal(moveSettingsSelection(0, 1, true), 1);
  assert.equal(moveSettingsSelection(1, 1, true), 2);
  assert.equal(moveSettingsSelection(0, 1, false), 2);
  assert.equal(moveSettingsSelection(2, -1, false), 0);
});

test('settings back action retains an explicit pointer target', () => {
  assert.equal(settingsBackHitTest(640, 544), true);
  assert.equal(settingsBackHitTest(420, 544), false);
});
