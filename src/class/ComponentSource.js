const fs = require('fs')
const path = require('path')
const Stats = require('../lib/Stats')
const Base = require('./Base')
const camelCase = require('camelcase')
const read = require('fs-readdir-recursive')
const Component = require('./Component')

class ComponentSource extends Base {
  constructor(dirpath = '', parent = null) {
    super(dirpath, parent)
    if (!Stats.isDir(dirpath)) {
      throw new Error('not directory: ' + dirpath)
    }
    this._children = []
    this._initChildren()
  }

  appendChild(child) {
    this._children.push(child)
  }

  get children() {
    return this._children
  }

  _initChildren() {
    // console.log('run: _initChildren')
    const pathList = fs.readdirSync(this.path).filter(itemPath => itemPath[0] !== '.')
    pathList.sort((a, b) => {
      return a.split('/').length - b.split('/').length
    })
    for (const itemPath of pathList) {
      const resolvedPath = path.resolve(this.path, itemPath)
      // console.log('resolvedPath', resolvedPath)
      if (!Stats.isExist(resolvedPath)) continue
      // console.log('exists!')
      const child = (() => {
        return Stats.isDir(resolvedPath) ? new ComponentSource(resolvedPath, this) : new Component(resolvedPath, this)
      })()
      this.appendChild(child)
    }
  }
}

module.exports = ComponentSource
