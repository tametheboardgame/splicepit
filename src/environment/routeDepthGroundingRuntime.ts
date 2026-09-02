import {
  RSP6_ROUTE_SCENE_PACK,
  routeGroundingShadowAt,
  routeSceneForegroundOccluders,
} from '../world/routeDepthGrounding.js';

/**
 * RSP-6 Bright Route depth helpers. Production activation remains owned by
 * RSP-7; these helpers are intentionally renderer-agnostic so the replacement
 * path can adopt them without re-authoring depth coordinates.
 */
export function drawRouteGroundingShadow(
  ctx: CanvasRenderingContext2D,
  playerFeetX: number,
  playerFeetY: number,
): void {
  const shadow = routeGroundingShadowAt(playerFeetX, playerFeetY);
  ctx.save();
  ctx.fillStyle = `rgba(28, 38, 31, ${shadow.alpha})`;
  ctx.beginPath();
  ctx.ellipse(
    Math.round(shadow.x),
    Math.round(shadow.y),
    shadow.radiusX,
    shadow.radiusY,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.restore();
}

export function drawRouteBrightForegroundDepth(
  ctx: CanvasRenderingContext2D,
  brightBaseImage: CanvasImageSource,
  playerFeetY: number,
): readonly string[] {
  const scale = RSP6_ROUTE_SCENE_PACK.source.scale;
  const activeOccluders = routeSceneForegroundOccluders(playerFeetY);

  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (const occluder of activeOccluders) {
    const bounds = occluder.bounds;
    ctx.drawImage(
      brightBaseImage,
      bounds.x / scale,
      bounds.y / scale,
      bounds.width / scale,
      bounds.height / scale,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
    );
  }
  ctx.restore();

  return activeOccluders.map((occluder) => occluder.id);
}
