import { defineFieldKind } from '../define-field-kind/define-field-kind';
import { type FieldKind } from '../define-field-kind/field-kind';
import { fileDefinition } from '../file/definition';
import { FileComponent } from '../file/component';
import { numberDefinition } from '../number/definition';
import { NumberComponent } from '../number/component';
import { selectDefinition } from '../select/definition';
import { SelectComponent } from '../select/component';
import { textDefinition } from '../text/definition';
import { TextComponent } from '../text/component';
import { textareaDefinition } from '../textarea/definition';
import { TextareaComponent } from '../textarea/component';

/**
 * The registry the renderer uses: every kind with its component. It is the same list as
 * `FIELD_DEFINITIONS` (definitions.ts) with components added; a test keeps the two in step. Adding a
 * kind means adding its folder, one line in each list, and one member of the `FieldModel` union.
 */
const FIELD_KINDS: readonly FieldKind[] = [
  defineFieldKind('text', textDefinition, TextComponent),
  defineFieldKind('number', numberDefinition, NumberComponent),
  defineFieldKind('textarea', textareaDefinition, TextareaComponent),
  defineFieldKind('select', selectDefinition, SelectComponent),
  defineFieldKind('file', fileDefinition, FileComponent),
];

export { FIELD_KINDS };
