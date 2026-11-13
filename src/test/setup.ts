import './undici-globals';
import '@testing-library/jest-dom/vitest';
import 'vi-axe/extend-expect';
import { server } from './server';

// 'error' makes any request without a handler fail loudly (MSW 3 renamed onUnhandledRequest).
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
