import type {
  Identifier,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
} from '@babel/types'
import type { MemberRef } from '../type'
import { MODULE_ALL, MODULE_DEFAULT } from './constants'

export default function (
  specifier: ImportDefaultSpecifier | ImportNamespaceSpecifier | ImportSpecifier,
): MemberRef | null {
  const alias = specifier.local.name
  switch (specifier.type) {
    case 'ImportSpecifier':
      return {
        name: (specifier.imported as Identifier).name,
        alias,
      }
    case 'ImportDefaultSpecifier':
      return {
        name: MODULE_DEFAULT,
        alias,
      }
    case 'ImportNamespaceSpecifier':
      return {
        name: MODULE_ALL,
        alias,
      }
  }
}
