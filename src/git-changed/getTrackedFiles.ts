import exec from './exec'
import gitRoot from './gitRoot'

const root = gitRoot()

/** @internal */
export default function getTrackedFiles(
  revision = 'HEAD',
  paths?: string[],
) {
  const pathsInCmd = (paths != null) && (paths.length > 0) ? paths.join(' ') : root
  const raw = exec(
    `git ls-tree -r ${revision} --name-only --full-name ${pathsInCmd}`,
  )
  return raw.split('\n')
}
