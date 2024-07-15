import * as path from 'node:path'
import type { Resolver } from './types'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const core = new Set(require('node:module').builtinModules)

export default async function resolveModule(
  resolver: Resolver,
  modRelativePath: string,
  baseDir: string,
): Promise<string> {
  let modPath = '' as string | void
  if (path.isAbsolute(modRelativePath) || core.has(modRelativePath)) {
    modPath = modRelativePath
  }
  else {
    try {
      modPath = await resolver(baseDir, modRelativePath)
    }
    catch (e) {
      // do nothing
    }
    if (!modPath) {
      modPath = /\.\w+$/.test(modRelativePath)
        ? path.resolve(baseDir, modRelativePath)
        : modRelativePath
    }
    else if (/node_modules\//.test(modPath)) {
      modPath = modRelativePath
    }
  }
  return modPath
}
