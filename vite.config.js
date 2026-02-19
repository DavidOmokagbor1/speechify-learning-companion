import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import figmaMcpPlugin from './vite-plugin-figma-mcp.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    figmaMcpPlugin({
      figmaToken: process.env.FIGMA_TOKEN,
      figmaFileId: process.env.FIGMA_FILE_ID,
      outputDir: 'src/components/generated',
      includeTailwind: true,
      includeStories: false
    })
  ],
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: false,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000,
  },
})
