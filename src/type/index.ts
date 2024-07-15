import { type SourceLocation } from '@babel/types'

export type Module = string
export type Member = string
export type Members = Member[] | '*'
export interface MemberRef {
  name: Member
  alias: Member
}

interface HasLoc {
  loc: SourceLocation | null | undefined
}
export type ImportBase = MemberRef & {
  source: Module
}
export type Import = ImportBase & HasLoc
export interface Exports {
  extends?: Module[]
  members: Array<MemberRef & HasLoc>
}
export type Declarations = Record<string, HasLoc & {
  dependencies: Array<Member | ImportBase>
}>
export type MemberRelation = Record<string, Array<Member | ImportBase>>

export interface Entry {
  source: Module
  name: Member
}
