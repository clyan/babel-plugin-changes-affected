import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    outDir: './lib',
    format: ['cjs', 'esm', 'iife'],
    dts: true,
    clean: true,
    sourcemap: true,
    minify: !options.watch,
    legacyOutput: true,
  }
})