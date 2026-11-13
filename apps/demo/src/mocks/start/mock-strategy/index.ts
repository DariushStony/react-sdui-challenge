import type { MockVia } from '../mock-via';

/** One way of answering the app's requests; it rejects when the browser does not allow it. */
type MockStrategy = {
  readonly via: MockVia;
  readonly start: () => Promise<void>;
};

export type { MockStrategy };
