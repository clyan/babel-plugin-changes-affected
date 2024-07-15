import path from 'node:path'
import exec from './exec'
import gitRoot from './gitRoot'

const ROOT = gitRoot()
function getRelativePath(file: string) {
  return (path.isAbsolute(file) ? path.relative(ROOT, file) : file).replaceAll('\\', '/')
}

/** @internal */
export default function getRevisionFile(revision: string, file: string) {
  return exec(`git show ${revision}:${getRelativePath(file)}`)
}
