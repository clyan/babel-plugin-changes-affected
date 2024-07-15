/* eslint-disable prefer-rest-params */
import type { Visitor } from '@babel/traverse'
/**
 * Merge multiple @babel/traverse visitor objects into one.
 * Example:
 * ```
 * mergeVisitors(
 *  {
 *    Identifier(node) {
 *      console.log(1);
 *    }
 *  },
 *  {
 *    Identifier(node) {
 *      console.log(2);
 *    }
 *  }
 * );
 * ```
 * @param visitors @babel/traverse visitors
 */
export default function mergeVisitors(...visitors: Visitor[]): Visitor {
  return visitors.reduce((ret, visitor, i) => {
    if (!i)
      return visitor

    Object.keys(visitor).forEach((key) => {
      type Key = keyof typeof visitor
      const value = visitor[key as Key]
      const existing = ret[key as Key]
      if (existing) {
        const enterSuper
          = typeof existing === 'function' ? existing : existing.enter
        const currentEnter = typeof value === 'function' ? value : value?.enter
        // @ts-expect-error
        ret[key] = {
          enter() {
            if (enterSuper)
              // @ts-expect-error
              enterSuper.apply(this, arguments)

            if (currentEnter)
              // @ts-expect-error
              currentEnter.apply(this, arguments)
          },
          exit() {
            // @ts-expect-error
            if (existing.exit)
              // @ts-expect-error
              existing.exit.apply(this, arguments)
            // @ts-expect-error
            if (value.exit)
              // @ts-expect-error
              value.exit.apply(this, arguments)
          },
        }
      }
      else {
        // @ts-expect-error
        ret[key] = value
      }
    })
    return ret
  }, {} as Visitor)
}
