const path = require('path')
const Stats = require('../lib/Stats')

class Base {
  constructor(filepath, parent = null) {
    if (!Stats.isExist(filepath)) {
      throw new Error('not exist: ' + filepath)
    }
    this._path = filepath
    this._parent = parent
  }

  setParent(parent = null) {
    this._parent = parent
  }

  isComponent() {
    return this.extname !== ''
  }

  get parent() {
    return this._parent
  }

  get path() {
    return this._path
  }

  get extname() {
    return path.extname(this.path)
  }

  get name() {
    return path.basename(this.path, this.extname)
  }

  getRoot() {
    if (this.parent !== null) {
      let parentNode = this.parent
      while (parentNode) {
        if (parentNode.parent == null) {
          return parentNode
        } else {
          parentNode = parentNode.parent
        }
      }
    }
    return this
  }

  isRoot() {
    return this === this.getRoot()
  }
}

module.exports = Base
