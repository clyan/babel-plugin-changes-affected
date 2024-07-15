import _debug from 'debug'
import { type Affected } from '../hunt-affected'
import { DEFAULT_EXTENSIONS, GIT_OPERATION } from './constants'
import { getGitDiffs } from './getGitDiffs'
import hasExt from './hasExt'
import huntRevisionImpact from './huntRevisionImpact'
import { type Change } from './types'

import { type Options as HuntRevisionImpactOptions } from './huntRevisionImpact'

const debug = _debug('git-changes-affected:affected')

export type Options = HuntRevisionImpactOptions & {
  /** The end result revision. Default to `HEAD`. */
  to?: string
  /** The revision to compare from. Default to one commit before `to` revision. */
  from?: string
}

/**
 * Compare 2 git revisions and find out what module declarations are affected by these changes.
 * @param opts
 */
export default async function gitChangesAffected(
  opts: Options = {},
): Promise<Affected> {
  const extensions = opts.extensions || DEFAULT_EXTENSIONS
  const to = opts.to || 'HEAD'
  const diffs = getGitDiffs(to, opts.from)
  const befores = [] as Change[]
  const afters = [] as Change[]
  diffs.forEach(({ source, target, operation }) => {
    if (operation !== GIT_OPERATION.new && source.file && hasExt(source.file, extensions))
      befores.push(source)

    if (operation !== GIT_OPERATION.delete && target.file && hasExt(target.file, extensions))
      afters.push(target)
  })
  const affected = await huntRevisionImpact(
    opts.from || `${to}~1`,
    befores,
    opts,
  )
  debug('before affected:', affected)
  const toMerge = await huntRevisionImpact(to, afters, opts)
  debug('after affected:', toMerge)
  Object.keys(toMerge).forEach((mod) => {
    const members = toMerge[mod]
    affected[mod] = affected[mod]
      ? new Set([...Array.from(affected[mod]), ...Array.from(members)])
      : members
  })
  return affected
}
