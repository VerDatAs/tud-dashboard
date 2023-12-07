import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(),
      cssInjectedByJsPlugin()
  ],
  assetsInclude: ['**/*.xml'],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      name: 'VerDatAsDashboard',
      formats: ['umd'],
    },
    rollupOptions: {
      // Avoid having varying names
      // Idea: Do not overwrite the .html file to avoid manipulating the code itself
      // https://github.com/vitejs/vite/issues/378#issuecomment-768816653
      output: {
        globals: {
          vue: 'Vue'
        },
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        manualChunks: undefined,
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  // Define a custom name for the .html file and serve it
  // https://stackoverflow.com/a/71359021
  server: {
    open: '/index.html'
  }
})

