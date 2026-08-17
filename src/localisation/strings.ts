const EN_GB = {
  'title.logo.top': 'SPLICE',
  'title.logo.bottom': 'PIT',
  'title.tagline': 'A SMALL BUSINESS IN CREATIVE BIOLOGY',
  'title.refunds': 'No refunds for viable tissue.',
  'title.newGame': 'NEW GAME',
  'title.continue': 'CONTINUE',
  'title.version': 'R0.2 / FOUNDATION',

  'intro.eyebrow': 'AFTER THE GAS',
  'intro.title': 'Morning finds the pit quiet.',
  'intro.body': 'The rampaging splice is dead. So is your SpliceMaster. So are the other apprentices. The emergency gas did exactly what it was meant to do, eventually.\n\nYou are still alive. Which leaves the damaged pit, its remaining equipment and every unpaid bill in your hands.',
  'intro.firstJob': 'FIRST JOB',
  'intro.objective': 'Obtain a clean base animal.',
  'intro.openDoor': 'OPEN THE DOOR',

  'lab.ledger': 'PIT LEDGER',
  'lab.autoSave': '[AUTO-SAVE ENABLED]',
  'lab.prompt.interact': '[{control}] {name}',
  'lab.object.spliceBench': 'SPLICE BENCH',
  'lab.object.geneCabinet': 'GENE CABINET',
  'lab.object.animalPen': 'ANIMAL PEN',
  'lab.object.noticeBoard': 'NOTICE BOARD',
  'lab.object.fitPitGate': 'FIT PIT GATE',
  'lab.objective.findAnimal': 'Obtain a clean base animal from the surviving pen.',
  'lab.objective.collectGenes': 'Recover at least one viable gene sample.',
  'lab.objective.splice': 'Use the splice bench to create a viable creature.',
  'lab.objective.fight': 'Take your creature through the Fit Pit gate.',
  'lab.objective.complete': 'Vertical slice complete. The pit is technically a business again.',
  'lab.status.cash': 'CASH       £{value}',
  'lab.status.debt': 'DEBT       £{value}',
  'lab.status.base': 'BASE       {value}',
  'lab.status.genes': 'GENES      {value}',
  'lab.status.creature': 'CREATURE   {value}',
  'lab.status.wins': 'PIT WINS   {value}',
  'lab.none': 'NONE',
  'lab.message.animalAlready': 'The rabbit is already logged as your base specimen. It looks unconvinced by the promotion.',
  'lab.message.animalAcquiredTitle': 'BASE ANIMAL ACQUIRED',
  'lab.message.animalAcquired': '{name}: {description}\n\nThe surviving gene cabinet may still contain usable samples.',
  'lab.message.needBaseForGenes': 'Samples remain viable, but you need a base animal before any of this becomes useful.',
  'lab.message.noGenesLeft': 'You have taken every viable prototype sample: Gecko Regeneration, Boar Myofibre and Moth Chemosense.',
  'lab.message.geneRecoveredTitle': 'GENE SAMPLE RECOVERED',
  'lab.message.geneRecovered': '{name}\n{description}\n\nReturn to the splice bench when you are ready to make a bad decision.',
  'lab.message.noBaseAtBench': 'No base animal. The machine can only make alarming noises at you.',
  'lab.message.noGenesAtBench': 'The bench survived. The sample rack did not. Find usable genetic material first.',
  'lab.message.noCreatureAtGate': 'The house accepts many things as a combatant. An empty transport cage is not one of them. Splice something first.',
  'lab.message.noticeBoard': 'OUTSTANDING PIT DEBT: £{debt}\n\nFIT PIT LICENCE: SUSPENDED PENDING DEMONSTRATION BOUT\n\nHandwritten underneath: “If it can stand, it can fight.”',

  'splice.eyebrow': 'SPLICE BENCH / EXPERIMENTAL MODE',
  'splice.title': 'Learn first. Risk later.',
  'splice.instructions': 'Choose a disposable test animal or your main creature, then choose real source material. Tests consume stock but improve what you know. Forecasts are confidence ranges, never guarantees. Changes to a creature are permanent.',
  'splice.return': 'RETURN TO PIT',
  'splice.subjectHeading': '1 / SUBJECT',
  'splice.sourceHeading': '2 / PHYSICAL SOURCE MATERIAL',
  'splice.forecastHeading': '3 / WHAT YOU THINK YOU KNOW',
  'splice.mainTag': 'MAIN',
  'splice.testTag': 'TEST',
  'splice.selectedSubject': '{name}\n{role} / {base} / {life}\nIrreversible attempts: {attempts}',
  'splice.selectedSource': '{name}\nPhysical stock remaining: {stock}',
  'splice.noSubject': 'No subject selected.',
  'splice.noSource': 'No source material selected.',
  'splice.runTest': 'RUN TEST SPLICE',
  'splice.prepareMain': 'COMMIT MAIN CREATURE...',
  'splice.confirmMain': 'CONFIRM IRREVERSIBLE COMMIT',
  'splice.noKnownWarnings': 'No specific visible warning.',
  'splice.unknownRemain': 'UNKNOWN FACTORS REMAIN',
  'splice.unknownReduced': 'UNKNOWN FACTORS REDUCED, NOT ELIMINATED',
  'splice.forecastBody': 'RESEARCH {confidence} / {observations} OBS\nVIABLE EXPRESSION {viableLow}–{viableHigh}%\nADVERSE OUTCOME {adverseLow}–{adverseHigh}%\nCOMPATIBILITY {compatibility}\n{unknown}\nREAGENT {reagent}\nKNOWN: {warnings}',
  'splice.subjectDeceased': 'SUBJECT DECEASED\nNo further splice is possible. Its history remains available for comparison.',
  'splice.forecastUnavailable': 'Select a living subject and available source material.',
  'splice.historyHeading': 'RECENT COMPARABLE EXPERIMENTS',
  'splice.noExperiments': 'No comparable experiment recorded yet.',
  'splice.noneEstablished': 'No expression established.',
  'splice.none': 'NONE',
  'splice.mutationDetected': 'DETECTED / UNANALYSED',
  'splice.outcomeBody': 'OUTCOME {outcome}\nEXPRESSION {established}\nSTABILITY {before}% -> {after}% | INJURY {injury}\nMUTATION {mutation}\nHISTORY {history} attempt(s)',
  'splice.irreversibleWarning': 'MAIN CREATURE COMMIT ARMED.\nThis consumes material and permanently changes this individual. Rejection, injury, mutation, permanent damage or death are possible.\nConfirm only if you accept the result.',
  'splice.outcomePrompt': 'Test first, compare the records, then decide whether the evidence is worth risking the main creature.',
  'splice.attemptError': 'ATTEMPT BLOCKED\n{message}',

  'battle.eyebrow': 'FIT PIT / DEMONSTRATION BOUT',
  'battle.title': 'If it can stand, it can fight.',
  'battle.openingLog': 'The bell rings. The licensing clerk looks away.',
  'battle.attack': 'ATTACK',
  'battle.trait': 'USE TRAIT',
  'battle.brace': 'BRACE',
  'battle.hp': 'HP {current}/{maximum}',
  'battle.guard': '{name} braces against the next hit.',
  'battle.win': 'HOUSE CREATURE DOWN.\n\nDemonstration bout recorded. £30 purse transferred directly against the pit debt. A deeply unimpressed clerk stamps your temporary licence.',
  'battle.loss': 'YOUR CREATURE IS DOWN.\n\nThe Fit Pit returns it alive enough to try again. No purse. No sympathy.',
  'battle.return': 'RETURN TO YOUR PIT',
  'battle.retry': 'TRY AGAIN',
} as const;

export type StringId = keyof typeof EN_GB;
export type LocaleId = 'en-GB';
export type StringVariables = Readonly<Record<string, string | number>>;

const packs: Record<LocaleId, Readonly<Record<StringId, string>>> = {
  'en-GB': EN_GB,
};

let activeLocale: LocaleId = 'en-GB';

export function getLocale(): LocaleId {
  return activeLocale;
}

export function setLocale(locale: LocaleId): void {
  activeLocale = locale;
}

export function availableLocales(): readonly LocaleId[] {
  return Object.keys(packs) as LocaleId[];
}

export function t(id: StringId, variables: StringVariables = {}): string {
  const template = packs[activeLocale][id];
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) => {
    const value = variables[key];
    return value === undefined ? match : String(value);
  });
}
