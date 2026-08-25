import { TITLE_SPLASH_PART_0 } from './titleSplashPart0.js';
import { TITLE_SPLASH_PART_1 } from './titleSplashPart1.js';
import { TITLE_SPLASH_PART_2 } from './titleSplashPart2.js';
import { TITLE_SPLASH_PART_3 } from './titleSplashPart3.js';
import { TITLE_SPLASH_PART_4 } from './titleSplashPart4.js';

const HAPPY_TITLE_SPLASH_BASE64 =
  `${TITLE_SPLASH_PART_0}${TITLE_SPLASH_PART_1}${TITLE_SPLASH_PART_2}${TITLE_SPLASH_PART_3}${TITLE_SPLASH_PART_4}`;

export type HappyTitleSplashStatus = 'idle' | 'loading' | 'ready' | 'error';
type HappyTitleSplashDebug = { status: HappyTitleSplashStatus; error: string | null; encodedLength: number };

let happyTitleImage: HTMLImageElement | null = null;
let happyTitleStatus: HappyTitleSplashStatus = 'idle';
let happyTitleError: string | null = null;
let happyTitleObjectUrl: string | null = null;

function syncDebug(): void {
  (globalThis as typeof globalThis & { __SPLICEPIT_HAPPY_SPLASH__?: HappyTitleSplashDebug }).__SPLICEPIT_HAPPY_SPLASH__ = {
    status: happyTitleStatus,
    error: happyTitleError,
    encodedLength: HAPPY_TITLE_SPLASH_BASE64.length,
  };
}

function revokeObjectUrl(): void {
  if (!happyTitleObjectUrl || typeof URL === 'undefined') return;
  URL.revokeObjectURL(happyTitleObjectUrl);
  happyTitleObjectUrl = null;
}

function decodeSplashBlob(): Blob {
  if (typeof atob !== 'function') throw new Error('Base64 decoding is unavailable');
  const binary = atob(HAPPY_TITLE_SPLASH_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: 'image/webp' });
}

export function primeHappyTitleSplash(): void {
  if (happyTitleStatus !== 'idle') return;
  if (typeof Image === 'undefined' || typeof URL === 'undefined') {
    happyTitleStatus = 'error';
    happyTitleError = 'Browser image APIs are unavailable';
    syncDebug();
    return;
  }

  happyTitleStatus = 'loading';
  syncDebug();
  try {
    const blob = decodeSplashBlob();
    const objectUrl = URL.createObjectURL(blob);
    happyTitleObjectUrl = objectUrl;
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => {
      happyTitleImage = image;
      happyTitleStatus = 'ready';
      happyTitleError = null;
      syncDebug();
      revokeObjectUrl();
    };
    image.onerror = () => {
      happyTitleStatus = 'error';
      happyTitleError = 'Approved happy splash artwork failed to decode';
      syncDebug();
      revokeObjectUrl();
    };
    image.src = objectUrl;
    happyTitleImage = image;
  } catch (error) {
    happyTitleStatus = 'error';
    happyTitleError = error instanceof Error ? error.message : String(error);
    syncDebug();
    revokeObjectUrl();
  }
}

export function getHappyTitleSplashImage(): HTMLImageElement | null {
  primeHappyTitleSplash();
  return happyTitleStatus === 'ready' ? happyTitleImage : null;
}

export function getHappyTitleSplashStatus(): HappyTitleSplashStatus {
  primeHappyTitleSplash();
  return happyTitleStatus;
}

export function getHappyTitleSplashError(): string | null {
  return happyTitleError;
}

syncDebug();
