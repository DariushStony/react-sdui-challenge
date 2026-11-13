import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // The manifest tells scripts/check-dist.mjs which chunks are loaded up front and which on demand.
  build: { manifest: true },
  test: {
    globals: true,
    // jsdom is the default because the accessibility check needs it (ADR-0009).
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.ts'],
  },
});
