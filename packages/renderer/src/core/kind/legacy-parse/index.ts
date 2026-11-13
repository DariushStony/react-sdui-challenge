import type { FieldModel } from '../../model/field-model';
import type { FieldParse } from '../field-parse';

/** `'not-mine'` lets several kinds share one legacy `type` (text and number are both "input"). */
type LegacyParse<F extends FieldModel> = 'not-mine' | FieldParse<F>;

export type { LegacyParse };
