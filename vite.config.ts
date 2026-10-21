import { defineConfig } from 'vite';

// Relative base so the build works whether it's served from the domain root
// (Vercel) or a repo subpath (GitHub Pages: /<repo>/).
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: false,
  },
});
