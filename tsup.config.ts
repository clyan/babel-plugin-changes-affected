import { resolve } from 'node:path'
import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    outDir: './lib',
    format: ['cjs'],
    dts: true,
    clean: true,
    sourcemap: !!options.watch,
    minify: !options.watch,
    splitting: true,
    cjsInterop: true,
    // 如果使用 import 语句引入了cjs模块，同时cjs模块导出的是module.exports.default, 那么可以通过如下方式纠正导出解决
    // https://github.com/evanw/esbuild/issues/532#issuecomment-1028893869
    esbuildPlugins: [
      {
        // name 可以随意命名
        name: 'modules-exports-default-parser',
        setup(build) {
          build.onResolve({ filter: /^@babel\/traverse$/ }, ({ kind }) => {
            if (kind === 'import-statement')
              return { path: resolve(__dirname, './esbuild/plugin/babel-traverse-wrapper.js') }
          })
        },
      },
    ],
  }
})