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
    return camelCase(this.name, { pascalCase: true })
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
