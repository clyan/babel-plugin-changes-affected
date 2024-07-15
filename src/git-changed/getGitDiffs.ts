import _debug from 'debug'
import exec from './exec'
import { GIT_OPERATION } from './constants'
import { type Diff } from './types'
import getRevisionFile from './getRevisionFile'

const debug = _debug('git-changes-affected:diff')

function justifyOperation(operatelog: string): GIT_OPERATION {
  if (operatelog.startsWith('new file mode'))
    return GIT_OPERATION.new

  if (operatelog.startsWith('deleted file mode'))
    return GIT_OPERATION.delete

  /** @todo confirm rename similarity percentage */
  if (operatelog.startsWith('similarity index'))
    return GIT_OPERATION.rename

  return GIT_OPERATION.change
}
function isLineRemoved(content: string): boolean {
  return content.startsWith('-')
}
function isLineAdded(content: string): boolean {
  return content.startsWith('+')
}

/**
 * Compare 2 git revisions and get an object refelcting the changes.
 * @param to Git revision.
 * @param from Git revision.
 */
export function getGitDiffs(to: string, from?: string): Diff[] {
  from = from || `${to}~1`
  const strOut = exec(`git diff ${from} ${to}`)
  const diffs = [] as Diff[]
  let lineA = 0
  let lineB = 0
  let aChangeStart = null as number | null
  let bChangeStart = null as number | null
  const diffLines = strOut.split('\n')
  debug(`>>> ${from}...${to}`)
  diffLines.forEach((content, index) => {
    const lastDiff = diffs[diffs.length - 1]

    const fileHeadMatch = content.match(
      /^diff --git a\/([^\n\s]+) b\/([^\n\s]+)/,
    )
    const chunkHeadMatch = content.match(
      /@@ -(\d+)(,\d+)? \+(\d+)(,\d+)? @@( .+)?/,
    )
    const isLastLine
      = index === diffLines.length - 1 || !(fileHeadMatch == null) || !(chunkHeadMatch == null)
    const isAdded = isLineAdded(content)
    const isRemoved = isLineRemoved(content)
    debug(
      `${from}...${to} ${content} > ${((fileHeadMatch != null)
        && fileHeadMatch.slice(1))
      || ((chunkHeadMatch != null)
        && chunkHeadMatch.slice(
          1,
        ))} | last line: ${isLastLine} | ${isRemoved}, ${isAdded} | ${(lastDiff != null)
        && lastDiff.operation}`,
    )

    if (lastDiff != null) {
      const aChanges = lastDiff.source.changed
      const bChanges = lastDiff.target.changed
      if (lastDiff.operation !== GIT_OPERATION.rename) {
        if (isRemoved && !aChangeStart)
          aChangeStart = lineA

        if ((!isRemoved || isLastLine) && aChangeStart) {
          debug(
            `${from} -${lastDiff.source.file} ${aChangeStart}-${lineA - 1}`,
          )
          aChanges.push({
            start: aChangeStart,
            end: lineA - 1,
          })
          aChangeStart = null
        }
        if (!isAdded && lineA) lineA++
      }
      if (isAdded && !bChangeStart)
        bChangeStart = lineB

      if ((!isAdded || isLastLine) && bChangeStart) {
        debug(`${to} +${lastDiff.target.file} ${bChangeStart}-${lineB - 1}`)
        bChanges.push({
          start: bChangeStart,
          end: lineB - 1,
        })
        bChangeStart = null
      }
      if (!isRemoved && lineB) lineB++
      if (isLastLine) {
        lineA = lineB = 0
        aChangeStart = bChangeStart = null
      }
    }

    if (fileHeadMatch != null) {
      const [sourceFile, targetFile] = fileHeadMatch.slice(1)
      const line = diffLines[index + 1]
      const operation = line ? justifyOperation(line) : undefined
      diffs.push({
        source: {
          file: sourceFile,
          content:
            operation === GIT_OPERATION.new
              ? null
              : sourceFile ? getRevisionFile(`${from}`, sourceFile) : null,
          changed:
            operation === GIT_OPERATION.rename
              ? [
                {
                  start: 0,
                  end: Infinity,
                },
              ]
              : [],
        },
        target: {
          file: targetFile,
          content:
            operation === GIT_OPERATION.delete
              ? null
              : targetFile ? getRevisionFile(to, targetFile) : null,
          changed: [],
        },
        operation,
      })
      return
    }

    if (chunkHeadMatch != null) {
      lineA = chunkHeadMatch[1] ? parseInt(chunkHeadMatch[1], 10) : 0
      lineB = chunkHeadMatch[3] ? parseInt(chunkHeadMatch[3], 10) : 0
      debug(
        `${from}...${to} chunk start -${lastDiff.source.file}:${lineA} +${lastDiff.target.file}:${lineB}`,
      )
    }
  })
  return diffs
}

export default getGitDiffs
