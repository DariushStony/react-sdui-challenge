/** How the mock answers: through a service worker, or by wrapping `fetch` in the page (ADR-0018). */
type MockVia = 'service-worker' | 'fetch';

export type { MockVia };
