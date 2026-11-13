import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// One project per workspace package, so each runs with its own setup; jsdom is the default because
// the accessibility check needs it (ADR-0009).
const jsdomProject = (name: string, root: string) => ({
  root,
  plugins: [react()],
  test: {
    name,
    globals: true,
    environment: 'jsdom' as const,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});

export default defineConfig({
  test: {
    projects: [
      jsdomProject('renderer', 'packages/renderer'),
      jsdomProject('demo', 'apps/demo'),
      // The repository's own rules (lint, styles, CI, build output) are tested from the root.
      { test: { name: 'tooling', globals: true, include: ['tests/**/*.test.ts'] } },
    ],
    coverage: {
      provider: 'v8',
      // The pure logic is where a silent bug would hurt most, so it carries the target (TC-S09).
      include: [
        'packages/renderer/src/core/**/*.ts',
        'packages/renderer/src/fields/**/definition.ts',
      ],
      exclude: ['**/*.test.ts'],
      reporter: ['text-summary', 'text'],
      thresholds: { lines: 90 },
    },
  },
});
