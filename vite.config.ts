import { defineConfig } from 'vite';

export default defineConfig({
  // Keep built asset URLs relative so a future static host can use a subdirectory.
  base: './',
});
