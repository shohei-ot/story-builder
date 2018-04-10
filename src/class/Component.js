const Stats = require('../lib/Stats')
const Base = require('./Base')
const camelCase = require('camelcase')

class Component extends Base {
  constructor(filepath = '', parent = null) {
    super(filepath, parent)
    if (!Stats.isFile(filepath)) {
      throw new Error('not file: ' + filepath)
    }
  }

  get componentName() {
    let name = this.name
    name = camelCase(name, { pascalCase: true })

    const validVarPtrn = new RegExp('^[a-z$_][a-z0-9$_]*$', 'im')
    const allowedVarCharStartPtrn = new RegExp('^[a-zA-Z$_]', 'i')
    const invalidVarcharPtrn = new RegExp('[^a-z0-9$_]', 'gi')

    // JSが変数名に使えない文字列を含む場合
    if (!allowedVarCharStartPtrn.test(name)) {
      name = 'the_' + name
    }
    if (!validVarPtrn.test(name)) {
      name = name.replace(invalidVarcharPtrn, '_')
    }

    return camelCase(name, { pascalCase: true })
  }

  getComponentInfo() {
    return {
      componentName: this.componentName,
      storyName: this.getStoryName(),
      name: this.name,
      path: this.path
    }
  }

  getStoryName() {
    const nameList = []
    nameList.push(this.componentName)
    let parentNode = this.parent
    while (parentNode) {
      if (parentNode !== null && !parentNode.isRoot()) {
        nameList.push(camelCase(parentNode.name, { pascalCase: true }))
        if (parentNode.parent !== null && !parentNode.parent.isRoot()) {
          parentNode = parentNode.parent
        } else {
          parentNode = null
        }
      } else {
        parentNode = null
      }
    }
    nameList.reverse()
    return nameList.join('/')
  }
}

module.exports = Component
