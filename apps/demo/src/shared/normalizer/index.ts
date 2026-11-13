import type { normalize } from '@dynamic-form/renderer/core';

/** Anything that turns a payload into a parse result: the renderer's `normalize`, or a stand-in in a test. */
type Normalizer = typeof normalize;

export type { Normalizer };
