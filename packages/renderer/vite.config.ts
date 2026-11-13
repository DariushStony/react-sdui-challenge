import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// The published build: one ES module, with React and the two form libraries left for the host to
// provide (they are peer dependencies), plus the stylesheet of the default components and the
// design tokens (ADR-0014).
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-tokens',
      apply: 'build',
      closeBundle() {
        copyFileSync(
          resolve(import.meta.dirname, 'src/default-kit/tokens.css'),
          resolve(import.meta.dirname, 'dist/tokens.css'),
        );
      },
    },
  ],
  build: {
    sourcemap: true,
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: 'index', cssFileName: 'styles' },
    rollupOptions: {
      external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/, 'react-hook-form', 'zod'],
    },
  },
});
