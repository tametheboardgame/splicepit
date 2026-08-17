import { ids } from '../domain/ids.js';
import type { ActionDefinition, CapabilityDefinition } from '../domain/model.js';
import { PROTOTYPE_COMBAT_ACTION_RULES } from '../domain/combat.js';
import { CANONICAL_BASE_ANIMALS, CANONICAL_SOURCE_PACKAGES } from './biologyCatalog.js';

function humaniseCapability(value: string): string {
  return value
    .split('.')
    .map((part) => part.replaceAll('_', ' '))
    .join(' / ');
}

const canonicalCapabilityHooks = [...new Set([
  ...CANONICAL_BASE_ANIMALS.flatMap((animal) => [...animal.baselineCapabilityHooks]),
  ...CANONICAL_SOURCE_PACKAGES.flatMap((source) => (
    source.expressions.flatMap((expression) => [...expression.capabilityHooks])
  )),
])].sort();

/**
 * Capability definitions describe the semantic biological functions already
 * emitted by R0.3. Their exact numerical balance and arena thresholds remain
 * outside WP0.4A.
 */
export const PROTOTYPE_COMBAT_CAPABILITIES: readonly CapabilityDefinition[] = canonicalCapabilityHooks.map((hook) => ({
  id: ids.capability(hook),
  status: 'prototype',
  revision: 1,
  name: humaniseCapability(hook),
  description: `WP0.4A combat capability generated from functional biology: ${hook}.`,
  environment: null,
}));

export const PROTOTYPE_COMBAT_ACTIONS: readonly ActionDefinition[] = PROTOTYPE_COMBAT_ACTION_RULES.map((rule) => ({
  id: rule.id,
  status: 'prototype',
  revision: 1,
  name: rule.name,
  description: rule.description,
  requiredCapabilityIds: [...rule.requiredCapabilityIds],
}));
