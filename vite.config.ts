/**
 * Dashboard for the assistance system developed as part of the VerDatAs project
 * Copyright (C) 2022-2024 TU Dresden (Max Schaible, Tommy Kubica)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import banner from 'vite-plugin-banner'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [
    vue(),
    banner('/**\n' +
      ' * Dashboard for the assistance system developed as part of the VerDatAs project\n' +
      ' * Copyright (C) 2022-2024 TU Dresden (Max Schaible, Niklas Harbig, Sebastian Kucharski, Tommy Kubica)\n' +
      ' *\n' +
      ' * This program is free software: you can redistribute it and/or modify\n' +
      ' * it under the terms of the GNU General Public License as published by\n' +
      ' * the Free Software Foundation, either version 3 of the License, or\n' +
      ' * (at your option) any later version.\n' +
      ' *\n' +
      ' * This program is distributed in the hope that it will be useful,\n' +
      ' * but WITHOUT ANY WARRANTY; without even the implied warranty of\n' +
      ' * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the\n' +
      ' * GNU General Public License for more details.\n' +
      ' *\n' +
      ' * You should have received a copy of the GNU General Public License\n' +
      ' * along with this program.  If not, see <http://www.gnu.org/licenses/>.\n' +
      ' *\n' +
      ' * Please find the licenses of the third-party libraries used here: ./THIRD-PARTY-tud-dashboard.md\n' +
      ' */'),
    cssInjectedByJsPlugin()
  ],
  assetsInclude: ['**/*.xml'],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/main.ts', import.meta.url)),
      name: 'VerDatAsDashboard',
      formats: ['umd']
    },
    rollupOptions: {
      // Avoid having varying names with hashes: https://github.com/vitejs/vite/issues/378#issuecomment-768816653
      output: {
        globals: {
          vue: 'Vue'
        },
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        manualChunks: undefined
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
  // Define a custom name for the .html file and serve it: https://stackoverflow.com/a/71359021
  server: {
    open: '/index.html'
  }
})
