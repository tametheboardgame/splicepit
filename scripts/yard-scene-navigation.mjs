const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function moveAxis({ readState, axis, target, positive, negative, tolerance = 9, label }) {
  let previous = null;
  let stalled = 0;
  for (let attempt = 0; attempt < 160; attempt += 1) {
    const current = await readState();
    if (current?.sceneMode && current.sceneMode !== 'yard') return current;
    const value = axis === 'x' ? current.playerX : current.playerY;
    const delta = target - value;
    if (Math.abs(delta) <= tolerance) return current;
    if (previous !== null && Math.abs(value - previous) < 0.6) stalled += 1;
    else stalled = 0;
    if (stalled >= 10) {
      throw new Error(`${label} stalled on ${axis} towards ${target}: ${JSON.stringify(current)}`);
    }
    previous = value;
    await (delta > 0 ? positive : negative)();
    await sleep(20);
  }
  throw new Error(`${label} failed to reach ${axis}=${target}: ${JSON.stringify(await readState())}`);
}

/**
 * Navigate the human-reviewed YSP-10 Bright Yard through visible open ground.
 *
 * The earlier helper deliberately used the narrow upper pit seam. YSP-10 closes
 * that impossible route, so traversal now follows the readable player route:
 * south of the splice pit, east through the open foreground/container depth
 * band, then north into the visible Master Lab tunnel. This keeps automated
 * route tests aligned with the collision and depth contract seen by players.
 */
export async function traverseAuthoredYardToMasterLabTunnel({
  readState,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  label = 'YSP-10 Yard navigation',
}) {
  // Drop below the splice-pit collider while remaining above the lower-right
  // solid container base and service-ring footprint.
  await moveAxis({ readState, axis: 'y', target: 580, positive: moveDown, negative: moveUp, tolerance: 5, label });

  // Cross the intentionally traversable foreground band. The cryo/container
  // artwork occludes the protagonist here, but no giant invisible wall should.
  await moveAxis({ readState, axis: 'x', target: 1115, positive: moveRight, negative: moveLeft, tolerance: 6, label });

  // Enter the visible tunnel from below. The helper returns as soon as the
  // Yard runtime hands off to master-lab-route.
  return moveAxis({ readState, axis: 'y', target: 340, positive: moveDown, negative: moveUp, tolerance: 8, label });
}
