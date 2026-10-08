import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Served from GitHub Pages at /bd-urban-studio/admin/ (the customer web app owns the root).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/bd-urban-studio/admin/' : '/',
  plugins: [react(), tailwindcss()],
}));
