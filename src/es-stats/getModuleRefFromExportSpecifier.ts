import type {
  ExportDefaultSpecifier,
  ExportNamespaceSpecifier,
  ExportSpecifier,
  Identifier,
} from '@babel/types'
import type { MemberRef } from '../type'

export default function (
  specifier: ExportSpecifier | ExportDefaultSpecifier | ExportNamespaceSpecifier,
): MemberRef | null {
  if (specifier.type === 'ExportSpecifier') {
    const alias = (specifier.exported as Identifier).name
    return {
      name: specifier.local.name,
      alias,
    }
  }
  return null
}
