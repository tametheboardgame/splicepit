import { assertValidContentCatalog } from '../domain/validation.js';
import { CONTENT_CATALOG } from './contentCatalog.js';

assertValidContentCatalog(CONTENT_CATALOG);
console.log('Content validation passed.');
