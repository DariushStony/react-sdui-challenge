// A dynamic import so none of MSW is in the main chunk of an app that runs against a real backend
// (ADR-0005). It rejects when the browser will not register the worker.
async function startWorker(): Promise<void> {
  const { worker } = await import('../../browser');
  await worker.start({
    onUnhandledFrame: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  });
}

export { startWorker };
