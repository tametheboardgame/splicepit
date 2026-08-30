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
 * Navigate the authored Bright Yard through visible open corridors rather than
 * relying on frame-duration dead reckoning. These waypoints correspond to the
 * open path west of the service ring, north of the pit-west machinery, down the
 * service gap, then east along the corridor into the visible Master Lab tunnel.
 */
export async function traverseAuthoredYardToMasterLabTunnel({
  readState,
  moveLeft,
  moveRight,
  moveUp,
  moveDown,
  label = 'YSP-7 Yard navigation',
}) {
  await moveAxis({ readState, axis: 'x', target: 600, positive: moveRight, negative: moveLeft, label });
  await moveAxis({ readState, axis: 'y', target: 290, positive: moveDown, negative: moveUp, label });
  await moveAxis({ readState, axis: 'x', target: 785, positive: moveRight, negative: moveLeft, label });
  await moveAxis({ readState, axis: 'y', target: 385, positive: moveDown, negative: moveUp, label });
  return moveAxis({ readState, axis: 'x', target: 1110, positive: moveRight, negative: moveLeft, tolerance: 14, label });
}
