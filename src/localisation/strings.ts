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
  'lab.object.geneCabinet': 'SOURCE ARCHIVE',
  'lab.object.animalPen': 'ANIMAL HOLDING',
  'lab.object.noticeBoard': 'NOTICE BOARD',
  'lab.object.fitPitGate': 'FIT PIT GATE',
  'lab.objective.findAnimal': 'Choose a clean base animal from holding.',
  'lab.objective.collectGenes': 'Choose source material from the surviving archive.',
  'lab.objective.splice': 'Use the splice bench to experiment before risking your main creature.',
  'lab.objective.fight': 'Take your creature through the Fit Pit gate.',
  'lab.objective.complete': 'Vertical slice complete. The pit is technically a business again.',
  'lab.status.cash': 'CASH       £{value}',
  'lab.status.debt': 'DEBT       £{value}',
  'lab.status.base': 'BASE       {value}',
  'lab.status.genes': 'SOURCES    {value}/10',
  'lab.status.creature': 'CREATURE   {value}',
  'lab.status.wins': 'PIT WINS   {value}',
  'lab.none': 'NONE',
  'lab.message.animalAlready': 'Your main base animal is already registered. Disposable test animals of all three opening species remain available at the splice bench.',
  'lab.message.animalAcquiredTitle': 'BASE ANIMAL CHOSEN',
  'lab.message.animalAcquired': '{name}: {description}\n\nThis individual is now your valued main creature base. The source archive is open.',
  'lab.message.needBaseForGenes': 'Choose your main base animal first. The archive clerk refuses to issue live material against a blank specimen record.',
  'lab.message.noGenesLeft': 'All ten opening source packages have been recovered from the archive.',
  'lab.message.geneRecoveredTitle': 'SOURCE MATERIAL RECOVERED',
  'lab.message.geneRecovered': '{name}\n{description}\n\nA finite playtest stock of this source is now available at the splice bench.',
  'lab.message.noBaseAtBench': 'No main base animal is registered yet. Choose one from animal holding first.',
  'lab.message.noGenesAtBench': 'No source material has been recovered yet. Choose a package from the archive first.',
  'lab.message.noCreatureAtGate': 'The house accepts many things as a combatant. An empty transport cage is not one of them. Splice something first.',
  'lab.message.noticeBoard': 'OUTSTANDING PIT DEBT: £{debt}\n\nFIT PIT LICENCE: SUSPENDED PENDING DEMONSTRATION BOUT\n\nHandwritten underneath: “If it can stand, it can fight.”',
  'lab.choice.animals.title': 'CHOOSE YOUR MAIN BASE ANIMAL',
  'lab.choice.animals.help': 'This is a real choice. Rabbit, Goat and Pig start with different bodies and biological constraints. You will still have disposable test animals of all three species for experiments.',
  'lab.choice.sources.title': 'SOURCE ARCHIVE / OPENING TEN',
  'lab.choice.sources.help': 'Choose which physical source package to recover. You can return for the others. Each recovered package supplies finite playtest material.',
  'lab.choice.available': 'AVAILABLE',
  'lab.choice.recovered': 'RECOVERED',
  'lab.choice.select': '[↑/↓] CHOOSE   [ENTER] TAKE   [ESC] BACK',

  'splice.eyebrow': 'SPLICE BENCH / EXPERIMENTAL MODE',
  'splice.title': 'Learn first. Risk later.',
  'splice.instructions': 'Start with disposable test stock. A valued main creature cannot be committed to a source until you have at least one real test result for that source. Tests consume material, but dead test animals are replaced automatically.',
  'splice.return': 'RETURN TO PIT',
  'splice.subjectHeading': '1 / SUBJECT',
  'splice.sourceHeading': '2 / PHYSICAL SOURCE MATERIAL',
  'splice.forecastHeading': '3 / WHAT YOU THINK YOU KNOW',
  'splice.mainTag': 'VALUED MAIN',
  'splice.testTag': 'DISPOSABLE TEST',
  'splice.mainRole': 'VALUED MAIN / PERMANENT',
  'splice.testRole': 'DISPOSABLE TEST STOCK',
  'splice.selectedSubject': '{name}\n{role}\n{base} / {life}\nIrreversible attempts: {attempts}',
  'splice.selectedSource': '{name}\nPhysical stock remaining: {stock}',
  'splice.noSubject': 'No subject selected.',
  'splice.noSource': 'No source material selected.',
  'splice.runTest': 'RUN DISPOSABLE TEST',
  'splice.prepareMain': 'RISK VALUED MAIN...',
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
  'splice.outcomeBody': 'LATEST OUTCOME {outcome}\nEXPRESSION {established}\nSTABILITY {before}% -> {after}% | INJURY {injury}\nMUTATION {mutation}\nHISTORY {history} attempt(s)',
  'splice.irreversibleWarning': 'VALUED MAIN COMMIT ARMED.\nThis consumes material and permanently changes this individual. Rejection, injury, mutation, permanent damage or death are possible.\nConfirm only if you accept losing this creature.',
  'splice.mainNeedsTest': 'VALUED MAIN LOCKED\nRun at least one DISPOSABLE TEST with this source package first. The main creature cannot be used as the experiment that teaches you the basics.',
  'splice.testReplacementReady': 'TEST SUBJECT LOST. Animal holding has supplied a fresh disposable subject of the same species.',
  'splice.mainReplacementReady': 'VALUED MAIN LOST. Its history remains permanent; a fresh unmodified base animal has been registered so the game is not soft-locked.',
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
