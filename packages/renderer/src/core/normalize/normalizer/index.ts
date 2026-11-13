import type { ParseResult } from '../../issues/parse-result';

/**
 * Builds the one function that turns any payload into the canonical model (ADR-0001). It knows no
 * field kind by name: it only uses the definitions it is given (ADR-0002), so adding a kind never
 * means editing it. `normalize(raw, formId)` never throws; it returns a model or a typed rejection.
 */
/** The function `createNormalizer` builds: any payload in, a model or a typed rejection out. */
type Normalizer = (raw: unknown, formId: string) => ParseResult;

export type { Normalizer };
