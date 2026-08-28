type CutsceneState = {
  readonly controlLocked?: boolean;
};

type DisasterState = {
  readonly started?: boolean;
  readonly status?: string;
};

type PresentationGlobal = typeof globalThis & {
  __SPLICEPIT_CUTSCENE__?: { state?: CutsceneState };
  __SPLICEPIT_RINOCOW_DISASTER__?: { state?: DisasterState };
};

const STYLE_ID = 'wp07b-presentation-fix-style';

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* WP0.7B corrective pass: never move the room canvas itself. The authored
       focus cues still control timing, but the room remains clipped to its
       normal viewport instead of exposing the Yard beneath it. */
    body.wp07b-cutscene-active #master-lab-stage,
    body.wp07b-cutscene-active #rinocow-disaster-stage {
      transform: translate(-50%, -50%) !important;
      transition: none !important;
    }

    /* The Find your Master card has fulfilled its purpose as soon as the
       disaster begins. Keep that space clear for cutscene dialogue. */
    body.wp07b-objective-cleared #mobile-gameplay-hud [data-mobile-hud="objective"] {
      display: none !important;
    }

    body.wp07b-cutscene-active #mobile-gameplay-hud [data-mobile-hud="tutorial"] {
      display: none !important;
    }

    /* During cutscenes only ACTION remains. Movement, run, bag, map and back
       would otherwise cover dialogue despite being runtime-locked anyway. */
    body.wp07b-cutscene-active #mobile-gameplay-controls .mobile-dpad,
    body.wp07b-cutscene-active #mobile-gameplay-controls .mobile-utility-row,
    body.wp07b-cutscene-active #mobile-gameplay-controls .mobile-back-button {
      display: none !important;
    }

    body.wp07b-cutscene-active #mobile-gameplay-controls .mobile-action-cluster {
      right: calc(14px + env(safe-area-inset-right));
      bottom: calc(14px + env(safe-area-inset-bottom));
    }

    body.wp07b-cutscene-active #mobile-gameplay-controls .mobile-primary-row {
      display: flex !important;
    }

    body.wp07b-cutscene-active #mobile-gameplay-controls .mobile-action-button {
      display: block !important;
    }

    /* Dialogue replaces the objective card at the top of the viewport. Fixed
       positioning keeps it independent of the game canvas and mobile controls. */
    #rinocow-disaster-dialogue {
      position: fixed !important;
      top: calc(12px + env(safe-area-inset-top)) !important;
      bottom: auto !important;
      left: 50% !important;
      width: min(760px, calc(100vw - 24px)) !important;
      max-height: min(42vh, 280px);
      overflow: auto;
      z-index: 60 !important;
    }

    @media (pointer: coarse) {
      #rinocow-disaster-dialogue {
        padding: 11px 13px 10px !important;
        border-width: 2px !important;
        outline-width: 2px !important;
      }

      #rinocow-disaster-dialogue .wp07b-speaker {
        font-size: 10px !important;
        margin-bottom: 4px !important;
      }

      #rinocow-disaster-dialogue .wp07b-text {
        font-size: clamp(14px, 4vw, 18px) !important;
        line-height: 1.24 !important;
      }

      #rinocow-disaster-dialogue .wp07b-hint {
        margin-top: 5px !important;
        font-size: 9px !important;
      }

      /* The impact flash is enough feedback on a phone. Large root shudders
         are disorientating in portrait and can expose adjacent layers. */
      #game.wp07b-shudder {
        animation: none !important;
      }
    }
  `;
  document.head.append(style);
}

function syncPresentationState(): void {
  const global = globalThis as PresentationGlobal;
  const cutsceneActive = Boolean(global.__SPLICEPIT_CUTSCENE__?.state?.controlLocked);
  const disasterStarted = Boolean(global.__SPLICEPIT_RINOCOW_DISASTER__?.state?.started);

  document.body.classList.toggle('wp07b-cutscene-active', cutsceneActive);
  if (disasterStarted) document.body.classList.add('wp07b-objective-cleared');

  window.setTimeout(syncPresentationState, 40);
}

ensureStyle();
syncPresentationState();

export {};
