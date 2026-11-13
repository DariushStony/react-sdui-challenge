/** How a submit went, in the three ways the UI cares about (API contract 5.2). */
type SubmitResponse =
  | { readonly type: 'success'; readonly body: unknown }
  | { readonly type: 'validation'; readonly body: unknown }
  | { readonly type: 'network' };

export type { SubmitResponse };
