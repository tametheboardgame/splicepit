import {
  RSP6_ROUTE_SCENE_PACK,
  routeGroundingShadowAt,
  routeSceneForegroundOccluders,
} from '../world/routeDepthGrounding.js';

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

function drawForegroundSource(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  playerFeetY: number,
): readonly string[] {
  const scale = RSP6_ROUTE_SCENE_PACK.source.scale;
  const activeOccluders = routeSceneForegroundOccluders(playerFeetY);
  for (const occluder of activeOccluders) {
    const bounds = occluder.bounds;
    ctx.drawImage(
      image,
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
  return activeOccluders.map((occluder) => occluder.id);
}

export function drawRouteBrightForegroundDepth(
  ctx: CanvasRenderingContext2D,
  brightBaseImage: CanvasImageSource,
  playerFeetY: number,
): readonly string[] {
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const active = drawForegroundSource(ctx, brightBaseImage, playerFeetY);
  ctx.restore();
  return active;
}

/**
 * RSP-7 uses the exact same authored occluder bounds for Bright and Dark.
 * The Dark crop is blended with the same mix as the full-scene base so there
 * can be no Bright seam around the protagonist during corruption transitions.
 */
export function drawRouteForegroundDepth(
  ctx: CanvasRenderingContext2D,
  brightBaseImage: CanvasImageSource,
  darkBaseImage: CanvasImageSource,
  playerFeetY: number,
  darkMix: number,
): readonly string[] {
  const mix = Math.max(0, Math.min(1, darkMix));
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const active = drawForegroundSource(ctx, brightBaseImage, playerFeetY);
  if (mix > 0) {
    ctx.globalAlpha = mix;
    drawForegroundSource(ctx, darkBaseImage, playerFeetY);
  }
  ctx.restore();
  return active;
}
