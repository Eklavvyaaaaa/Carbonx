import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  define: {
    // Polyfills for browser environment
    'process.env': {},
  },
  resolve: {
    alias: {
      buffer: 'buffer',
    },
  },
  server: {
    port: 5173,
    open: false,
  },
})
