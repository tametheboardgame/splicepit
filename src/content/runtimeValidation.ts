import { assertValidContentCatalog } from '../domain/validation.js';
import { PROTOTYPE_CONTENT_CATALOG } from './prototypeCatalog.js';

export function validateRuntimeContent(): void {
  assertValidContentCatalog(PROTOTYPE_CONTENT_CATALOG);
}
