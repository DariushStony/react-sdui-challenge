import { setupServer } from 'msw/node';
import { handlers } from '../../mocks/handlers/handlers';

// The same handlers the browser uses, so tests go through the real network path. A test that needs
// something else (a failure, a slow answer) overrides one route with server.use().
const server = setupServer(...handlers);

export { server };
