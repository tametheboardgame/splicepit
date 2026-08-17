import { t } from '../localisation/strings.js';
import type { StringId, StringVariables } from '../localisation/strings.js';

export interface DialogueDefinition {
  readonly id: string;
  readonly textId: StringId;
  readonly speakerId?: string;
  readonly audioRef?: string;
}

const DIALOGUE = {
  intro_aftermath: { id: 'intro_aftermath', textId: 'intro.body' },
  lab_animal_already: { id: 'lab_animal_already', textId: 'lab.message.animalAlready' },
  lab_animal_acquired: { id: 'lab_animal_acquired', textId: 'lab.message.animalAcquired' },
  lab_need_base_for_genes: { id: 'lab_need_base_for_genes', textId: 'lab.message.needBaseForGenes' },
  lab_no_genes_left: { id: 'lab_no_genes_left', textId: 'lab.message.noGenesLeft' },
  lab_gene_recovered: { id: 'lab_gene_recovered', textId: 'lab.message.geneRecovered' },
  lab_no_base_at_bench: { id: 'lab_no_base_at_bench', textId: 'lab.message.noBaseAtBench' },
  lab_no_genes_at_bench: { id: 'lab_no_genes_at_bench', textId: 'lab.message.noGenesAtBench' },
  lab_no_creature_at_gate: { id: 'lab_no_creature_at_gate', textId: 'lab.message.noCreatureAtGate' },
  lab_notice_board: { id: 'lab_notice_board', textId: 'lab.message.noticeBoard' },
} as const satisfies Record<string, DialogueDefinition>;

export type DialogueId = keyof typeof DIALOGUE;

export function getDialogueDefinition(id: DialogueId): DialogueDefinition {
  return DIALOGUE[id];
}

export function dialogueText(id: DialogueId, variables: StringVariables = {}): string {
  return t(DIALOGUE[id].textId, variables);
}
