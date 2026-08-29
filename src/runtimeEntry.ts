export {};

const query = new URLSearchParams(window.location.search);
const yardRenderer = query.get('yardRenderer');

if (yardRenderer === 'scene-image') {
  const { startYardSceneImageSpike } = await import('./yardSceneImageSpike.js');
  const started = await startYardSceneImageSpike();
  if (!started) await import('./boot.js');
} else {
  await import('./boot.js');
}
