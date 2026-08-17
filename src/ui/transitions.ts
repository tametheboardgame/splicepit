import Phaser from 'phaser';

export interface SceneTransitionOptions {
  readonly duration?: number;
  readonly data?: object;
}

export function fadeIn(scene: Phaser.Scene, duration = 160): void {
  scene.cameras.main.fadeIn(duration, 0, 0, 0);
}

export function transitionTo(scene: Phaser.Scene, target: string, options: SceneTransitionOptions = {}): void {
  const duration = options.duration ?? 160;
  const camera = scene.cameras.main;
  let completed = false;

  const startTarget = (): void => {
    if (completed) return;
    completed = true;
    scene.scene.start(target, options.data);
  };

  camera.once('camerafadeoutcomplete', startTarget);
  camera.fadeOut(duration, 0, 0, 0);
  scene.time.delayedCall(duration + 80, startTarget);
}

export function restartWithFade(scene: Phaser.Scene, duration = 160): void {
  const camera = scene.cameras.main;
  let completed = false;
  const restart = (): void => {
    if (completed) return;
    completed = true;
    scene.scene.restart();
  };
  camera.once('camerafadeoutcomplete', restart);
  camera.fadeOut(duration, 0, 0, 0);
  scene.time.delayedCall(duration + 80, restart);
}
