import { type ParserOptions } from '@babel/parser'
import _debug from 'debug'
import { type Affected, huntAffected } from '../hunt-affected'
import { DEFAULT_EXTENSIONS } from './constants'
import getAbsolutePath from './getAbsolutePath'
import getChangedEntries from './getChangedEntries'
import getRevisionFile from './getRevisionFile'
import getTrackedFiles from './getTrackedFiles'
import hasExt from './hasExt'
import IncludesFilePlugin from './includesFilePlugin'
import { type Change } from './types'

export interface Options {
  /** Paths where to look for JS modules, if you have customised modules other than npm's `node_modules`. */
  modules?: string[]
  // extensions?: string[],
  /** Module alias to a path */
  alias?: Record<string, string>
  /** `@babel/parser` options for parsing file to AST */
  parserOptions?: ParserOptions
  /** Limit paths of tracked files to check with. By default it will check all the git tracked files. */
  paths?: string[]
  /** Filter file extensions, default value: `['.js', '.jsx', '.ts', '.tsx]`. */
  extensions?: string[]
}

const debug = _debug('git-changes-affected:revision-impact')
/**
 * Find what module declarations will be affected by changing given code lines in given git revision context.
 * @param revision Git [revision](https://git-scm.com/docs/gitrevisions)
 * @param changes
 * @param options
 */
export default async function huntRevisionImpact(
  revision: string,
  changes: Change[],
  { alias, modules, parserOptions, paths, extensions }: Options,
): Promise<Affected> {
  const _extensions = extensions || DEFAULT_EXTENSIONS
  debug(`${revision} changes: ${JSON.stringify(changes)}`)
  const trackedFiles = getTrackedFiles(revision, paths)
    .filter(file => hasExt(file, _extensions))
    .map(getAbsolutePath)
  const entries = getChangedEntries(changes, parserOptions)
  debug(`${revision} entries: ${JSON.stringify(entries)}`)
  return huntAffected(trackedFiles, entries, {
    loader: async (file: string) => await Promise.resolve(getRevisionFile(revision, file)),
    resolverOptions: {
      extensions: _extensions,
      alias,
      modules,
      plugins: [new IncludesFilePlugin(trackedFiles, extensions)],
    },
    parserOptions,
  })
}
