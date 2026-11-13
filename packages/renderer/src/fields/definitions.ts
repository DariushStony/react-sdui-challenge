import type { KindDefinition } from '../core/kind';
import { createNormalizer } from '../core/normalize';
import { fileDefinition } from './file/definition';
import { numberDefinition } from './number/definition';
import { selectDefinition } from './select/definition';
import { textDefinition } from './text/definition';
import { textareaDefinition } from './textarea/definition';

/**
 * Every field kind the app understands. This list is the registry (ADR-0002): the normalizer, the
 * validator and the renderer are all built from it, so adding a kind means adding its folder and one
 * line here.
 */
export const FIELD_DEFINITIONS: readonly KindDefinition[] = [
  textDefinition,
  numberDefinition,
  textareaDefinition,
  selectDefinition,
  fileDefinition,
];

export const normalize = createNormalizer(FIELD_DEFINITIONS);
