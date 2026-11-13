import { withoutNodeServer } from '../../../test/without-node-server';
import { fetchNetwork } from '../../fetch-network';
import { NetworkReadyState } from 'msw/experimental';
import { startMocks } from '.';
import type { MockStrategy } from '../mock-strategy';

const starts = (via: MockStrategy['via']): MockStrategy & { calls: number } => {
  const strategy = {
    via,
    calls: 0,
    start: async () => {
      strategy.calls += 1;
    },
  };
  return strategy;
};

const cannotStart = (via: MockStrategy['via'], reason: unknown): MockStrategy => ({
  via,
  start: async () => {
    throw reason;
  },
});

// main.tsx awaits this before mounting the app, so it must never throw: a mock that cannot start
// becomes a message on the page, not a blank one (ADR-0005, EC-17). When the service worker cannot
// register (a Firefox private window, an embedded browser), the page answers requests itself
// (ADR-0018, EC-23).
describe('startMocks', () => {
  withoutNodeServer();
  afterEach(() => {
    vi.unstubAllEnvs();
    if (fetchNetwork.readyState === NetworkReadyState.ENABLED) fetchNetwork.disable();
  });

  it('does nothing when VITE_ENABLE_MOCKS is "false"', async () => {
    vi.stubEnv('VITE_ENABLE_MOCKS', 'false');
    const worker = starts('service-worker');
    expect(await startMocks([worker])).toEqual({ type: 'off' });
    expect(worker.calls).toBe(0);
  });

  it('uses the service worker when it starts, and leaves the fallback alone', async () => {
    const worker = starts('service-worker');
    const fetchMock = starts('fetch');
    expect(await startMocks([worker, fetchMock])).toEqual({ type: 'on', via: 'service-worker' });
    expect(fetchMock.calls).toBe(0);
  });

  it('falls back to answering fetch calls in the page when the worker cannot start', async () => {
    const status = await startMocks([
      cannotStart('service-worker', new Error('no service workers here')),
      starts('fetch'),
    ]);
    expect(status).toEqual({ type: 'on', via: 'fetch' });
  });

  it('reports every reason when no way to mock can start, instead of throwing', async () => {
    const status = await startMocks([
      cannotStart('service-worker', new Error('worker refused')),
      cannotStart('fetch', 'fetch is gone'),
    ]);
    expect(status.type).toBe('failed');
    expect(status.type === 'failed' && status.reason).toMatch(/worker refused.*fetch is gone/s);
  });

  it('starts the real ones by default: jsdom has no service worker, so fetch answers', async () => {
    const status = await startMocks();
    expect(status).toEqual({ type: 'on', via: 'fetch' });
  });
});
