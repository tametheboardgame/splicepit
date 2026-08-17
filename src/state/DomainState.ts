import type { GameDomainState } from '../domain/model.js';

export const EMPTY_DOMAIN_STATE: GameDomainState = {
  creatures: [],
  mainCreatureIds: [],
  testAnimalIds: [],
  materialStock: [],
  reagentStock: [],
  researchKnowledge: [],
  experimentHistory: [],
  progression: { activeStateIds: [], activeQuestIds: [], completedQuestIds: [] },
};

class DomainStateStore {
  private state: GameDomainState = structuredClone(EMPTY_DOMAIN_STATE);

  reset(): void { this.state = structuredClone(EMPTY_DOMAIN_STATE); }
  hydrate(state: GameDomainState): void { this.state = structuredClone(state); }
  snapshot(): GameDomainState { return structuredClone(this.state); }
}

export const domainState = new DomainStateStore();
