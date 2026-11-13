import { server } from '../server';

/**
 * For a test file that checks a way of mocking the page's own `fetch`. The Node server from the
 * setup patches `fetch` too; this steps it aside for the file and puts it back afterwards, because
 * the setup closes it once more at the end.
 */
function withoutNodeServer(): void {
  beforeAll(() => server.close());
  afterAll(() => server.listen({ onUnhandledFrame: 'error' }));
}

export { withoutNodeServer };
