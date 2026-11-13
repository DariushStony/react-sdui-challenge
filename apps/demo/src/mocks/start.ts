export type MockStatus =
  | { readonly type: 'off' }
  | { readonly type: 'on' }
  | { readonly type: 'failed'; readonly reason: string };

/**
 * Starts the mock service worker, unless `VITE_ENABLE_MOCKS=false`. The worker is a dynamic import
 * so none of MSW is in the main chunk of an app that runs against a real backend (ADR-0005). It
 * never throws: a failure comes back as a reason the page can show.
 */
export async function startMocks(): Promise<MockStatus> {
  if (import.meta.env['VITE_ENABLE_MOCKS'] === 'false') return { type: 'off' };
  try {
    const { worker } = await import('./browser');
    await worker.start({
      onUnhandledFrame: 'bypass',
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    });
    return { type: 'on' };
  } catch (error) {
    return { type: 'failed', reason: error instanceof Error ? error.message : String(error) };
  }
}
