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
  // https://github.com/vitejs/vite/issues/11136#issuecomment-1333007321
  // Disable minifying
  // TODO: However, this does not solve the issue that functions cannot be called from PHP code
  // esbuild: {
  //   minifyIdentifiers: false,
  //   minifySyntax: false
  // },
  // build: {
  //   minify: false,
  assetsInclude: ['**/*.xml'],
  build: {
    lib: {
      entry: process.env.BUILD_TARGET === 'MOODLE'
        ? fileURLToPath(new URL('./src/moodle.ts', import.meta.url))
        : fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      name: 'verdatas-dashboard-vue',
      formats: process.env.BUILD_TARGET === 'MOODLE' ? ['umd'] : ['es'],
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
    open: '/index.html' // ,
    // port: 8080
  }
})

