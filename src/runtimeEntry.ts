const query = new URLSearchParams(window.location.search);
const yardRenderer = query.get('yardRenderer');

async function startRuntime(): Promise<void> {
  if (yardRenderer === 'scene-image') {
    try {
      const { startYardSceneImageSpike } = await import('./yardSceneImageSpike.js');
      if (await startYardSceneImageSpike()) return;
    } catch (error) {
      console.warn('YSP-0 scene-image renderer failed; falling back to the standard runtime.', error);
    }
  }

  await import('./boot.js');
}

void startRuntime();
