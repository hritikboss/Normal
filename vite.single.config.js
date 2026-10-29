import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
// Builds ONE index.html (JS + CSS inlined) that opens by double-click. Used only for the "RUN" package.
export default defineConfig({ plugins: [react(), viteSingleFile()], base: './' })
