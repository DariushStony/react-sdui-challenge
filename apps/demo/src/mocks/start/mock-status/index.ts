type MockStatus =
  | { readonly type: 'off' }
  | { readonly type: 'on' }
  | { readonly type: 'failed'; readonly reason: string };

export type { MockStatus };
