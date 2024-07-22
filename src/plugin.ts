import { declare } from '@babel/helper-plugin-utils'
import type { PluginObj } from '@babel/core'
// 这句是必须的，不然ts报错。。

export interface Option {
  entry: string
  branch: string
}

const BabelPluginChangesAffected = declare<Option, PluginObj>((api, options) => {
  console.log('api', options)
  return {
    name: 'babel-plugin-changes-affected',
    visitor: {
      JSXElement(this, path, state) {
        console.info(this, path.state)
      },
    },
  }
})

export default BabelPluginChangesAffected