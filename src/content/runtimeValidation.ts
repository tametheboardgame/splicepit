import { assertValidContentCatalog } from '../domain/validation.js';
import { CONTENT_CATALOG } from './contentCatalog.js';

export function validateRuntimeContent(): void {
  assertValidContentCatalog(CONTENT_CATALOG);
}
