import { type GIT_OPERATION } from './constants'

export type { ParserOptions } from '@babel/parser'

export interface Diff {
  source: Change
  target: Change
  operation?: GIT_OPERATION
}

export interface Change {
  /** File path relative to the repo */
  file?: string
  content: string | null
  /** Changed file code line ranges */
  changed: Array<{
    start: number
    end: number
  }>
}
