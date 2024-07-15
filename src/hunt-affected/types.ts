import type { ParserOptions } from '@babel/parser'
import type { ResolveOptionsOptionalFS } from 'enhanced-resolve'
import type { Entry } from '../type'
import type { DECLARATION_TYPE } from './constants'

export type Resolver = (base: string, target: string) => Promise<string | void>
export interface Options {
  /** [enhanced-resolver](https://github.com/webpack/enhanced-resolve#resolver-options) options */
  resolverOptions?: ResolveOptionsOptionalFS
  /** Customised resolver function to resolve a module import path to absolute file path. If this options is used, `resolverOptions` will be ignored. */
  resolver?: Resolver
  /** Function for reading file content from absolute file path. Uses fs.readFileSync to read with decoding *utf8* by default. */
  loader?: (path: string) => Promise<string | void>
  /** Options provided by `@babel/parser`. Allow customize babel parser options while parsing file content to AST. */
  parserOptions?: ParserOptions
}

export type DeclarationNode = Entry & {
  affects: DeclarationNode[]
  type: DECLARATION_TYPE
}
export interface DependencyMap {
  [module: string]: {
    [member: string]: DeclarationNode
  }
}
