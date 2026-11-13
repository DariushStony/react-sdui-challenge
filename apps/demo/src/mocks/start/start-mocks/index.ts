import type { MockStatus } from '../mock-status';
import type { MockStrategy } from '../mock-strategy';
import { startFetchMock } from '../start-fetch-mock';
import { startWorker } from '../start-worker';

// The worker is the real thing: it answers in the network layer and shows up in the browser's own
// network panel. Some browsers will not register one (a Firefox private window, an embedded
// browser), and there the page answers `fetch` itself instead of showing a dead form (ADR-0018).
const STRATEGIES: readonly MockStrategy[] = [
  { via: 'service-worker', start: startWorker },
  { via: 'fetch', start: startFetchMock },
];

const reasonOf = (error: unknown) => (error instanceof Error ? error.message : String(error));

/**
 * Starts the mock, unless `VITE_ENABLE_MOCKS=false`, using the first way that works. It never
 * throws: when none works, the reasons come back so the page can show them (EC-17).
 */
async function startMocks(strategies: readonly MockStrategy[] = STRATEGIES): Promise<MockStatus> {
  if (import.meta.env['VITE_ENABLE_MOCKS'] === 'false') return { type: 'off' };
  const reasons: string[] = [];
  for (const { via, start } of strategies) {
    try {
      await start();
      return { type: 'on', via };
    } catch (error) {
      reasons.push(reasonOf(error));
    }
  }
  return { type: 'failed', reason: reasons.join(' | ') };
}

export { startMocks };
