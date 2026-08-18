import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PALETTE, TEXT } from '../config.js';
import { CONTENT_CATALOG } from '../content/contentCatalog.js';
import {
  buildLabSplicePlan,
  compareExperimentRecords,
  executeLabSplice,
  type LabExperimentResult,
  type LabSplicePlan,
} from '../domain/labExperimentation.js';
import type { CreatureId, SourcePackageId } from '../domain/ids.js';
import type { CreatureState, GameDomainState } from '../domain/model.js';
import { composePhenotype } from '../domain/phenotype.js';
import { SemanticInput } from '../input/SemanticInput.js';
import { t } from '../localisation/strings.js';
import { drawPhenotypeCreature } from '../render/PhenotypeRenderer.js';
import { runtimeRandom } from '../runtime/runtimeRandom.js';
import { domainState } from '../state/DomainState.js';
import {
  ensureR03LabPlaytestState,
  nextLabOperationIds,
  persistLabDomainState,
  replaceDeadMainCreature,
  retireDisposableTestSubject,
  syncLegacyMainCreature,
} from '../systems/labPlaytestSystem.js';
import { addNoiseLines, wrappedText } from '../ui/helpers.js';
import { addButton, addPanel, FocusMenu, type ButtonControl, type FocusableControl } from '../ui/primitives.js';
import { fadeIn, transitionTo } from '../ui/transitions.js';

function humanise(value: string): string {
  return value.replaceAll('_', ' ').toUpperCase();
}

function compact(value: string, maximum = 70): string {
  return value.length <= maximum ? value : `${value.slice(0, maximum - 3)}...`;
}

function sourceIdsFor(state: GameDomainState): SourcePackageId[] {
  return [...new Set([
    ...state.materialStock.map((lot) => lot.sourcePackageId),
    ...state.experimentHistory.map((observation) => observation.sourcePackageId),
  ])];
}

export class SpliceScene extends Phaser.Scene {
  semanticInput!: SemanticInput;
  menu!: FocusMenu;
  selectedSubjectId: CreatureId | null = null;
  selectedSourceId: SourcePackageId | null = null;
  confirmArmed = false;
  lastResult: LabExperimentResult | null = null;
  subjectText!: Phaser.GameObjects.Text;
  sourceText!: Phaser.GameObjects.Text;
  forecastText!: Phaser.GameObjects.Text;
  historyText!: Phaser.GameObjects.Text;
  outcomeText!: Phaser.GameObjects.Text;
  testButton!: ButtonControl;
  prepareButton!: ButtonControl;
  confirmButton!: ButtonControl;
  phenotype: Phaser.GameObjects.Container | null = null;

  constructor() { super('Splice'); }

  create(): void {
    const state = ensureR03LabPlaytestState();
    this.confirmArmed = false;
    this.lastResult = null;
    this.selectedSubjectId = state.testAnimalIds
      .map((id) => state.creatures.find((creature) => creature.id === id))
      .find((creature) => creature?.lifeState === 'living' && creature.spliceHistory.length === 0)?.id
      ?? state.mainCreatureIds[0]
      ?? null;
    this.selectedSourceId = sourceIdsFor(state)[0] ?? null;

    this.cameras.main.setBackgroundColor(PALETTE.paperDeep);
    fadeIn(this);
    this.drawMachine();
    addNoiseLines(this, 90, 0.045);
    this.add.text(35, 24, t('splice.eyebrow'), { ...TEXT.mono, fontSize: '11px', color: '#a0573d' });
    this.add.text(35, 46, t('splice.title'), { ...TEXT.title, fontSize: '32px' });
    wrappedText(this, 35, 86, t('splice.instructions'), 875, { fontSize: '14px' });

    addPanel(this, 28, 126, 255, 340, 0.95);
    addPanel(this, 296, 126, 278, 340, 0.95);
    addPanel(this, 588, 126, 344, 340, 0.95);
    this.add.text(47, 143, t('splice.subjectHeading'), { ...TEXT.mono, fontSize: '10px', color: '#b7c86c' });
    this.add.text(316, 143, t('splice.sourceHeading'), { ...TEXT.mono, fontSize: '10px', color: '#b7c86c' });
    this.add.text(608, 143, t('splice.forecastHeading'), { ...TEXT.mono, fontSize: '10px', color: '#b7c86c' });

    this.subjectText = this.add.text(47, 164, '', { ...TEXT.body, fontSize: '14px', wordWrap: { width: 215 } });
    this.sourceText = this.add.text(316, 164, '', { ...TEXT.body, fontSize: '14px', wordWrap: { width: 235 } });
    this.forecastText = this.add.text(608, 171, '', { ...TEXT.mono, fontSize: '9px', lineSpacing: 2, wordWrap: { width: 300 } });
    this.historyText = this.add.text(316, 329, '', { ...TEXT.mono, fontSize: '9px', lineSpacing: 3, wordWrap: { width: 235 } });
    this.outcomeText = this.add.text(608, 327, '', { ...TEXT.mono, fontSize: '9px', lineSpacing: 2, color: '#b7c86c', wordWrap: { width: 300 } });

    this.semanticInput = new SemanticInput(this);
    const controls: FocusableControl[] = [];
    const subjects = state.creatures.filter((creature) => state.mainCreatureIds.includes(creature.id) || state.testAnimalIds.includes(creature.id));
    subjects.forEach((subject, index) => {
      const label = `${subject.role === 'main' ? t('splice.mainTag') : t('splice.testTag')} ${subject.name}`;
      controls.push(addButton(this, 155, 215 + index * 42, 215, label, () => {
        this.selectSubjectSlot(subject.role, subject.baseAnimalId);
      }, { accent: subject.role === 'main' ? PALETTE.rust : PALETTE.moss }));
    });

    const sourceIds = sourceIdsFor(state);
    sourceIds.forEach((sourceId, index) => {
      const source = CONTENT_CATALOG.sourcePackages.find((candidate) => candidate.id === sourceId);
      if (!source) return;
      controls.push(addButton(this, 435, 215 + index * 46, 235, source.name, () => {
        this.selectedSourceId = source.id;
        this.confirmArmed = false;
        this.lastResult = null;
        this.refresh();
      }, { accent: PALETTE.bruise }));
    });

    this.testButton = addButton(this, 760, 440, 290, t('splice.runTest'), () => this.execute(false), { accent: PALETTE.acid });
    this.prepareButton = addButton(this, 760, 440, 290, t('splice.prepareMain'), () => {
      this.confirmArmed = true;
      this.refresh();
    }, { accent: PALETTE.rust });
    this.confirmButton = addButton(this, 760, 440, 290, t('splice.confirmMain'), () => this.execute(true), { accent: PALETTE.blood });
    const returnButton = addButton(this, 160, 500, 240, t('splice.return'), () => transitionTo(this, 'Lab'), { accent: PALETTE.rust });
    controls.push(this.testButton, this.prepareButton, this.confirmButton, returnButton);
    this.menu = new FocusMenu(this.semanticInput, controls, 'vertical');
    this.refresh();
  }

  update(): void {
    this.menu.update();
  }

  private drawMachine(): void {
    const g = this.add.graphics();
    g.fillStyle(PALETTE.paper, 0.72); g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    g.lineStyle(7, PALETTE.bruise, 0.16); g.lineBetween(540, 0, 610, GAME_HEIGHT);
    g.lineStyle(3, PALETTE.rustDark, 0.18); g.lineBetween(250, 0, 320, GAME_HEIGHT);
  }

  private selectSubjectSlot(role: 'main' | 'test', baseAnimalId: string): void {
    const state = domainState.snapshot();
    const idsForRole = role === 'main' ? state.mainCreatureIds : state.testAnimalIds;
    const current = idsForRole
      .map((id) => state.creatures.find((creature) => creature.id === id))
      .find((creature) => (
        creature?.role === role
        && creature.baseAnimalId === baseAnimalId
        && creature.lifeState === 'living'
        && (role === 'main' || creature.spliceHistory.length === 0)
      ));
    this.selectedSubjectId = current?.id ?? null;
    this.confirmArmed = false;
    this.lastResult = null;
    this.refresh();
  }

  private subject(state: GameDomainState): CreatureState | null {
    return state.creatures.find((creature) => creature.id === this.selectedSubjectId) ?? null;
  }

  private plan(state: GameDomainState, subject: CreatureState | null): LabSplicePlan | null {
    if (!subject || !this.selectedSourceId || subject.lifeState === 'deceased') return null;
    return buildLabSplicePlan(state, CONTENT_CATALOG, subject.id, this.selectedSourceId);
  }

  private hasTestEvidence(state: GameDomainState): boolean {
    if (!this.selectedSourceId) return false;
    return state.experimentHistory.some((observation) => (
      observation.sourcePackageId === this.selectedSourceId && observation.subjectRole === 'test'
    ));
  }

  private refresh(): void {
    const state = domainState.snapshot();
    const subject = this.subject(state);
    const source = CONTENT_CATALOG.sourcePackages.find((candidate) => candidate.id === this.selectedSourceId) ?? null;
    const plan = this.plan(state, subject);
    const base = subject ? CONTENT_CATALOG.baseAnimals.find((animal) => animal.id === subject.baseAnimalId) : null;
    const testEvidence = this.hasTestEvidence(state);
    const biology = subject ? (() => {
      try { return composePhenotype(subject, CONTENT_CATALOG); } catch { return null; }
    })() : null;

    this.subjectText.setText(subject
      ? t('splice.selectedSubject', {
        name: subject.name,
        role: subject.role === 'main' ? t('splice.mainRole') : t('splice.testRole'),
        base: base?.name ?? subject.baseAnimalId,
        life: humanise(subject.lifeState),
        attempts: subject.spliceHistory.length,
      })
      : t('splice.noSubject'));
    this.sourceText.setText(source
      ? t('splice.selectedSource', { name: source.name, stock: plan?.availableMaterial ?? 0 })
      : t('splice.noSource'));

    if (plan) {
      const warnings = plan.knownWarnings.length > 0
        ? plan.knownWarnings.slice(0, 2).map((warning) => compact(warning)).join(' | ')
        : t('splice.noKnownWarnings');
      this.forecastText.setText(t('splice.forecastBody', {
        confidence: humanise(plan.researchConfidence),
        observations: plan.observationCount,
        viableLow: plan.viableExpressionRange.lower,
        viableHigh: plan.viableExpressionRange.upper,
        adverseLow: plan.adversityRange.lower,
        adverseHigh: plan.adversityRange.upper,
        compatibility: humanise(plan.compatibilityProfile),
        unknown: plan.unknownFactorsRemain ? t('splice.unknownRemain') : t('splice.unknownReduced'),
        warnings,
        reagent: plan.availableReagent,
      }));
    } else {
      this.forecastText.setText(subject?.lifeState === 'deceased' ? t('splice.subjectDeceased') : t('splice.forecastUnavailable'));
    }

    const comparisons = this.selectedSourceId ? compareExperimentRecords(state, this.selectedSourceId, 5) : [];
    const comparisonBody = comparisons.length === 0
      ? t('splice.noExperiments')
      : comparisons.map((row) => `${humanise(row.baseAnimalId)} / ${humanise(row.subjectRole)} / ${humanise(row.resultCode)}`).join('\n');
    this.historyText.setText(`${t('splice.historyHeading')}\n${comparisonBody}`);

    if (this.lastResult) {
      const attempt = this.lastResult.creature.spliceHistory[this.lastResult.creature.spliceHistory.length - 1];
      const establishedFull = attempt?.expressions
        .filter((expression) => expression.expressed)
        .map((expression) => {
          const definition = source?.expressions.find((candidate) => candidate.id === expression.expressionId);
          return `${definition?.name ?? expression.expressionId}${expression.functional ? ' [FUNCTIONAL]' : ' [NON-FUNCTIONAL]'}`;
        })
        .join(', ') || t('splice.noneEstablished');
      const replacementNote = this.lastResult.observation.subjectRole === 'test'
        ? `\n${t('splice.testReplacementReady')}`
        : this.lastResult.creature.lifeState === 'deceased'
          ? `\n${t('splice.mainReplacementReady')}`
          : '';
      this.outcomeText.setText(`${t('splice.outcomeBody', {
        outcome: humanise(this.lastResult.resolution.outcomeBand),
        established: compact(establishedFull, 105),
        before: Math.round(this.lastResult.resolution.stabilityBefore * 100),
        after: Math.round(this.lastResult.resolution.stabilityAfter * 100),
        injury: humanise(this.lastResult.resolution.consequences.injurySeverity),
        mutation: this.lastResult.resolution.consequences.mutationTriggered ? t('splice.mutationDetected') : t('splice.none'),
        history: this.lastResult.creature.spliceHistory.length,
      })}${replacementNote}`);
    } else if (subject?.role === 'main' && !testEvidence) {
      this.outcomeText.setText(t('splice.mainNeedsTest'));
    } else if (subject?.role === 'test' && subject.spliceHistory.length > 0) {
      this.outcomeText.setText(t('splice.testSubjectSpent'));
    } else if (subject?.role === 'test' && testEvidence && (plan?.availableMaterial ?? 0) <= 1) {
      this.outcomeText.setText(t('splice.mainDoseReserved'));
    } else if (this.confirmArmed) {
      this.outcomeText.setText(t('splice.irreversibleWarning'));
    } else {
      this.outcomeText.setText(t('splice.outcomePrompt'));
    }

    if (this.phenotype) this.phenotype.destroy();
    this.phenotype = biology ? drawPhenotypeCreature(this, 155, 407, biology, { scale: 0.42 }) : null;

    const isMain = subject?.role === 'main';
    const canAttempt = Boolean(plan?.canAttempt);
    const disposableIsFresh = Boolean(subject?.role === 'test' && subject.spliceHistory.length === 0);
    const materialAllowsAnotherTest = (plan?.availableMaterial ?? 0) > 1;
    this.testButton.setVisible(Boolean(subject && !isMain));
    this.testButton.setEnabled(Boolean(subject && !isMain && canAttempt && disposableIsFresh && materialAllowsAnotherTest));
    this.prepareButton.setVisible(Boolean(subject && isMain && !this.confirmArmed));
    this.prepareButton.setEnabled(Boolean(subject && isMain && !this.confirmArmed && canAttempt && testEvidence));
    this.confirmButton.setVisible(Boolean(subject && isMain && this.confirmArmed));
    this.confirmButton.setEnabled(Boolean(subject && isMain && this.confirmArmed && canAttempt && testEvidence));
  }

  private execute(requireMainConfirmation: boolean): void {
    const state = domainState.snapshot();
    const subject = this.subject(state);
    if (!subject || !this.selectedSourceId) return;
    const plan = this.plan(state, subject);
    if (subject.role === 'test' && subject.spliceHistory.length > 0) {
      this.outcomeText.setText(t('splice.testSubjectSpent'));
      return;
    }
    if (subject.role === 'test' && (plan?.availableMaterial ?? 0) <= 1) {
      this.outcomeText.setText(t('splice.mainDoseReserved'));
      return;
    }
    if (subject.role === 'main' && !this.hasTestEvidence(state)) {
      this.confirmArmed = false;
      this.outcomeText.setText(t('splice.mainNeedsTest'));
      return;
    }
    if (subject.role === 'main' && (!requireMainConfirmation || !this.confirmArmed)) return;
    const operationIds = nextLabOperationIds(state);
    const attemptedAt = new Date().toISOString();
    try {
      const result = executeLabSplice(state, CONTENT_CATALOG, {
        subjectCreatureId: subject.id,
        sourcePackageId: this.selectedSourceId,
        attemptId: operationIds.attemptId,
        observationId: operationIds.observationId,
        mutationInstanceId: operationIds.mutationInstanceId,
        attemptedAt,
      }, runtimeRandom);

      let persistedState = result.state;
      if (subject.role === 'test') {
        persistedState = retireDisposableTestSubject(result.state, subject.id, attemptedAt);
      }
      persistLabDomainState(persistedState);

      if (subject.role === 'test') {
        const replacement = persistedState.testAnimalIds
          .map((id) => persistedState.creatures.find((creature) => creature.id === id))
          .find((creature) => (
            creature?.baseAnimalId === subject.baseAnimalId
            && creature.lifeState === 'living'
            && creature.spliceHistory.length === 0
          ));
        if (replacement) this.selectedSubjectId = replacement.id;
      }

      if (subject.role === 'main') {
        syncLegacyMainCreature(persistedState);
        if (result.creature.lifeState === 'deceased') {
          const replaced = replaceDeadMainCreature(subject.baseAnimalId);
          this.selectedSubjectId = replaced.mainCreatureIds[0] ?? null;
        }
      }

      this.lastResult = result;
      this.confirmArmed = false;
      this.cameras.main.flash(180, 183, 200, 108, false);
      if (result.resolution.consequences.injurySeverity !== 'none') this.cameras.main.shake(180, 0.006);
      this.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.outcomeText.setText(t('splice.attemptError', { message }));
      this.cameras.main.shake(140, 0.004);
    }
  }
}
