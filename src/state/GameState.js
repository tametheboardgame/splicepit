const INITIAL = {
  hasBaseAnimal: false,
  baseAnimalId: null,
  collectedGenes: [],
  currentCreature: null,
  coins: 12,
  debt: 860,
  fitPitWins: 0,
  questStage: 'find_animal',
  seenIntro: false,
};

class GameStateStore {
  constructor() { this.reset(); }

  reset() { Object.assign(this, structuredClone(INITIAL)); }

  hydrate(data = {}) {
    this.reset();
    Object.assign(this, data);
    this.collectedGenes = Array.isArray(data.collectedGenes) ? [...data.collectedGenes] : [];
  }

  acquireAnimal(id) {
    this.hasBaseAnimal = true;
    this.baseAnimalId = id;
    if (this.questStage === 'find_animal') this.questStage = 'collect_genes';
  }

  addGene(id) {
    if (!this.collectedGenes.includes(id)) this.collectedGenes.push(id);
    if (this.hasBaseAnimal && this.collectedGenes.length > 0 && this.questStage === 'collect_genes') {
      this.questStage = 'splice';
    }
  }

  setCreature(creature) {
    this.currentCreature = creature;
    this.questStage = 'fight';
  }

  recordWin(reward = 30) {
    this.fitPitWins += 1;
    this.coins += reward;
    this.debt = Math.max(0, this.debt - reward);
    this.questStage = 'slice_complete';
  }

  snapshot() {
    return {
      hasBaseAnimal: this.hasBaseAnimal,
      baseAnimalId: this.baseAnimalId,
      collectedGenes: [...this.collectedGenes],
      currentCreature: this.currentCreature ? structuredClone(this.currentCreature) : null,
      coins: this.coins,
      debt: this.debt,
      fitPitWins: this.fitPitWins,
      questStage: this.questStage,
      seenIntro: this.seenIntro,
    };
  }
}

export const gameState = new GameStateStore();
export { INITIAL };
