import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // The manifest tells scripts/check-dist.mjs which chunks are loaded up front and which on demand.
  build: { manifest: true },
});
