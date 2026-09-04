type RouteDebug = {
  ready?: boolean;
  phase?: string;
  sceneMode?: 'yard' | 'master-lab-route';
  routeRenderer?: 'legacy' | 'scene-image';
};

type LayerDebug = {
  active?: boolean;
};

type RoutePresentationGlobal = typeof globalThis & {
  __SPLICEPIT_VISUAL_RESET__?: RouteDebug;
  __SPLICEPIT_MASTER_LAB__?: LayerDebug;
  __SPLICEPIT_LOCAL_PIT__?: LayerDebug;
};

const ACTIVE_CLASS = 'route-presentation-active';

function routePresentationActive(): boolean {
  const globals = globalThis as RoutePresentationGlobal;
  const route = globals.__SPLICEPIT_VISUAL_RESET__;
  return Boolean(
    route?.ready
    && route.phase === 'confirmed'
    && route.sceneMode === 'master-lab-route'
    && route.routeRenderer === 'scene-image'
    && !globals.__SPLICEPIT_MASTER_LAB__?.active
    && !globals.__SPLICEPIT_LOCAL_PIT__?.active
  );
}

function syncRoutePresentation(): void {
  document.body.classList.toggle(ACTIVE_CLASS, routePresentationActive());
  requestAnimationFrame(syncRoutePresentation);
}

window.addEventListener('pagehide', () => document.body.classList.remove(ACTIVE_CLASS));
requestAnimationFrame(syncRoutePresentation);
