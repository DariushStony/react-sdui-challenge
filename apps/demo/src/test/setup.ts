import './undici-globals';
import '@testing-library/jest-dom/vitest';
import 'vi-axe/extend-expect';
import { resetMockState } from './reset-mock-state';
import { server } from './server';

// jsdom has no object URLs, and Vitest's stand-in cannot read the bytes of the Files these tests
// use (see undici-globals). Thumbnails only need an address, so any string will do.
// axe probes canvas support; jsdom does not implement it and would print a "Not implemented" notice.
if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: () => null });
}

Object.assign(URL, { createObjectURL: () => 'blob:test', revokeObjectURL: () => undefined });

// 'error' makes any request without a handler fail loudly (MSW 3 renamed onUnhandledRequest).
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  server.resetHandlers();
  resetMockState();
});
afterAll(() => server.close());
