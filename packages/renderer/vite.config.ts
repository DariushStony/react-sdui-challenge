import react from '@vitejs/plugin-react';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// The published build (ADR-0014): two ES modules, React and the two form libraries left for the host
// to provide (they are peer dependencies), plus the stylesheet of the default components and the
// design tokens. `index` is the client side and starts with "use client", so a framework with server
// components treats it as client code; `core` is logic only, with no React, and is safe on a server.
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
    lib: {
      entry: { index: 'src/index.ts', core: 'src/core-entry.ts' },
      formats: ['es'],
      cssFileName: 'styles',
    },
    rollupOptions: {
      external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/, 'react-hook-form', 'zod'],
      output: { banner: (chunk) => (chunk.name === 'index' ? '"use client";' : '') },
    },
  },
});
