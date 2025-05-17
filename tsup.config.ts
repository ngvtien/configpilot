// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['electron/main.ts'],
  format: ['cjs'],
  external: ['electron'],
  watch: true,
  outDir: 'dist/electron',
})
