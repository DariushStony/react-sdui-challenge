import { setupServer } from 'msw/node';

// Starts empty. Each test adds the handlers it needs with server.use(); the shared mock handlers
// arrive with the mock layer in a later phase.
export const server = setupServer();
