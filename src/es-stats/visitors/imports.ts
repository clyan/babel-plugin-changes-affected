import type { Visitor } from '@babel/traverse'
import type { ExportSpecifier, StringLiteral } from '@babel/types'
import type { Import } from '../../type'
import importSpecifier2Dependents from '../getModuleRefFromImportSpecifier'
import { MODULE_DEFAULT } from '../constants'
import getModuleRefFromExportSpecifier from '../getModuleRefFromExportSpecifier'

/**
 * Create a Babel visitor that will find out all the imports and save them into an object ref.
 * @param imports The object ref to save the imports result.
 */
export default function createExportVisitors(imports: Import[] = []): Visitor {
  return {
    ImportDeclaration({ node }) {
      const modulePath = node.source.value
      node.specifiers.forEach((specifier) => {
        const dep = importSpecifier2Dependents(specifier)
        if (dep) {
          const { name, alias } = dep
          imports.push({
            alias,
            name,
            source: modulePath,
            loc: specifier.loc,
          })
        }
      })
    },
    // Dynamic import support
    CallExpression({ node, parent, parentPath }) {
      /** @todo enable by plugin? */
      const { callee, arguments: args, loc } = node
      if (callee.type === 'Import' && args[0]?.type === 'StringLiteral') {
        const source = (args[0] as StringLiteral).value
        const scopedNaming = (member: string) => `${source}#${member}`
        const id = ((parent && parent.type === 'AwaitExpression'
          ? parentPath.parent
          : parent) as any).id
        if (id && id.type === 'ObjectPattern') {
          for (let i = id.properties.length; i--;) {
            const prop = id.properties[i]
            if (prop.type === 'RestElement')
              break

            const name = scopedNaming(prop.key.name)
            imports.push({
              alias: name,
              name,
              source,
              loc,
            })
          }
        }
        /** @todo identify which member */
        const name = scopedNaming(MODULE_DEFAULT)
        imports.push({
          alias: name,
          name,
          source,
          loc,
        })
      }
    },

    /**
     * a hack to include exported named from as dependency
     * @todo find proper way to do this
     */
    ExportNamedDeclaration({ node }) {
      const { specifiers, source, loc } = node
      if (!source || !specifiers.length)
        return

      specifiers.forEach((specifier) => {
        const dep = getModuleRefFromExportSpecifier(
          specifier as ExportSpecifier,
        )
        if (dep) {
          imports.push({
            ...dep,
            source: source.value,
            loc,
          })
        }
      })
    },
  }
}
