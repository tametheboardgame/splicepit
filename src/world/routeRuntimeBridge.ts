import type { RouteInteractionTarget } from './routeStoryIntegration.js';

export const ROUTE_INTERIOR_RETURN_EVENT = 'splicepit:route-interior-return';

export interface RouteInteriorReturnDetail {
  readonly target: Extract<RouteInteractionTarget, 'master-lab' | 'local-pit'>;
}

export function dispatchRouteInteriorReturn(target: RouteInteriorReturnDetail['target']): void {
  window.dispatchEvent(new CustomEvent<RouteInteriorReturnDetail>(ROUTE_INTERIOR_RETURN_EVENT, {
    detail: { target },
  }));
}

export function routeInteriorReturnDetail(event: Event): RouteInteriorReturnDetail | null {
  const detail = (event as CustomEvent<RouteInteriorReturnDetail>).detail;
  if (!detail || (detail.target !== 'master-lab' && detail.target !== 'local-pit')) return null;
  return detail;
}
