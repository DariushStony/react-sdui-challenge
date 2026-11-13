import type { MockVia } from '../mock-via';

type MockStatus =
  | { readonly type: 'off' }
  | { readonly type: 'on'; readonly via: MockVia }
  | { readonly type: 'failed'; readonly reason: string };

export type { MockStatus };
