import '@testing-library/jest-dom/vitest';
import 'vi-axe/extend-expect';

// axe probes canvas support; jsdom does not implement it and would print a "Not implemented" notice.
if (typeof HTMLCanvasElement !== 'undefined') {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: () => null });
}

// jsdom has no object URLs, and Vitest's stand-in cannot read the bytes of a jsdom File. Thumbnails
// only need an address, so any string will do.
Object.assign(URL, { createObjectURL: () => 'blob:test', revokeObjectURL: () => undefined });
