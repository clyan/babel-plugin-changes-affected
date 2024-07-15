import traverse from '@babel/traverse'
import type { File } from '@babel/types'
import type { Declarations, Exports, Import, MemberRelation } from '../type'
import mergeVisitors from './mergeVisitors'
import createExportVisitors from './visitors/exports'
import createImportVisitors from './visitors/imports'
import createRootRelationVisitors from './visitors/rootRelation'

/**
 * Extract imports, exports, and root declarations relations from an AST
 *  * Example:
 * ```
 * const fs = require('fs');
 * const { parse } = require('@babel/parse');
 *
 * extractStats(
 *  parse(
 *    fs.readFileSync('esfile.js', 'utf-8'),
 *    {
 *      sourceType: 'module'
 *      plugins: ['jsx']
 *    }
 *  )
 * );
 * ```
 *
 * @param ast File AST object
 */
export default function extractStats(
  ast: File,
): {
  imports: Import[]
  exports: Exports
  declarations: Declarations
  relations: MemberRelation
} {
  const imports = [] as Import[]
  const exports = { members: [] } as Exports
  const declarations = {} as Declarations
  traverse(
    ast,
    mergeVisitors(
      createExportVisitors(exports),
      createImportVisitors(imports),
      createRootRelationVisitors(declarations),
    ),
  )

  return {
    imports,
    exports,
    declarations,
    // Backward compact
    relations: Object.fromEntries(
      Object.keys(declarations).map(d => [d, declarations[d]?.dependencies]),
    ),
  }
}
