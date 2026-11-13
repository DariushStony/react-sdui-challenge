import { apiUrl } from '../../../api/base-url';
import { withoutNodeServer } from '../../../test/without-node-server';
import { fetchNetwork } from '../../fetch-network';
import { NetworkReadyState } from 'msw/experimental';
import { startFetchMock } from '.';

// ADR-0018: the same handlers, answered inside the page by wrapping fetch, for browsers that will
// not register a service worker.
describe('startFetchMock', () => {
  withoutNodeServer();
  afterEach(() => {
    if (fetchNetwork.readyState === NetworkReadyState.ENABLED) fetchNetwork.disable();
  });

  it('answers a form request with the same handlers the worker would use', async () => {
    await startFetchMock();
    const response = await fetch(apiUrl('/api/forms/car'));
    expect(response.status).toBe(200);
    const body = (await response.json()) as { fields: unknown[] };
    expect(body.fields.length).toBeGreaterThan(0);
  });

  it('reads a multipart submission, so the server-side rules still run', async () => {
    await startFetchMock();
    const form = new FormData();
    form.append('brand', 'bad');
    const response = await fetch(apiUrl('/api/forms/car-v2/submissions'), {
      method: 'POST',
      body: form,
    });
    expect(response.status).toBe(422);
  });

  it('puts fetch back when it is switched off', async () => {
    const before = globalThis.fetch;
    await startFetchMock();
    expect(globalThis.fetch).not.toBe(before);
    fetchNetwork.disable();
    expect(globalThis.fetch).toBe(before);
  });
});
