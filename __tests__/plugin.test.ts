import { parse } from '@babel/core'
import BabelPluginChangesAffected from '../lib/index'
describe('babel plugin mark git changed test', () => {
  test('can work', () => {
    const ast = parse(`
        export function CC() {
          return <div>CC1</div>
        }
      `, {
      filename: 'C.tsx',
      presets: ['@babel/preset-react', '@babel/preset-typescript'],
      plugins: [[BabelPluginChangesAffected, {}]],
    })
  })
})