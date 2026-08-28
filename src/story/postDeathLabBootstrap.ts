import {
  CUTSCENE_FLAG_EVENT,
  type CutsceneFlagEventDetail,
} from '../cutscene/browserCutsceneRuntime.js';
import { RINOCOW_DISASTER_FLAGS } from '../cutscene/rinocowDisaster.js';
import { postDeathLabState, type PostDeathLabSnapshot } from './postDeathLabState.js';

type PostDeathLabDebug = {
  readonly ready: true;
  snapshot: PostDeathLabSnapshot;
};

type PostDeathGlobal = typeof globalThis & {
  __SPLICEPIT_POST_DEATH_LAB__?: PostDeathLabDebug;
};

const debug: PostDeathLabDebug = {
  ready: true,
  snapshot: postDeathLabState.snapshot(),
};

function syncDebug(): void {
  debug.snapshot = postDeathLabState.snapshot();
}

postDeathLabState.subscribe(syncDebug);
window.addEventListener(CUTSCENE_FLAG_EVENT, (event) => {
  const detail = (event as CustomEvent<CutsceneFlagEventDetail>).detail;
  if (detail?.flag === RINOCOW_DISASTER_FLAGS.COMPLETE && detail.value === true) {
    postDeathLabState.activateAfterDisaster();
  }
});

(globalThis as PostDeathGlobal).__SPLICEPIT_POST_DEATH_LAB__ = debug;
