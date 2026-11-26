import { defineConfig } from 'vite';
export default defineConfig({
  base: process.env.BASE ?? '/',
  build: {
    outDir: 'dist', emptyOutDir: true, manifest: true, cssCodeSplit: false, target: 'es2020',
    rollupOptions: { input: 'src/main.ts' },
  },
});
