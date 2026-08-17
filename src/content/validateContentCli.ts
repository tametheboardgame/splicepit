import { assertValidContentCatalog } from '../domain/validation.js';
import { PROTOTYPE_CONTENT_CATALOG } from './prototypeCatalog.js';

assertValidContentCatalog(PROTOTYPE_CONTENT_CATALOG);
console.log('Content validation passed.');
