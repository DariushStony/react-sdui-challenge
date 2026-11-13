import { startMocks } from './start-mocks';

// main.tsx awaits this before mounting the app, so it must never throw: a worker that cannot
// start becomes a message on the page, not a blank one (ADR-0005, EC-17).
describe('startMocks', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('does nothing when VITE_ENABLE_MOCKS is "false"', async () => {
    vi.stubEnv('VITE_ENABLE_MOCKS', 'false');
    expect(await startMocks()).toEqual({ type: 'off' });
  });

  it('reports why the worker could not start instead of throwing', async () => {
    // jsdom has no service worker, which is the same situation as an unsupported or blocked browser.
    const status = await startMocks();
    expect(status.type).toBe('failed');
    expect(status.type === 'failed' && status.reason).toMatch(/\S/);
  });
});
