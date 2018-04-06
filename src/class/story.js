const fs = require('fs')
const path = require('path')
const Stats = require('./stats')
const read = require('fs-readdir-recursive')

class Story {
  constructor(importPath, type = 'vue') {
    // importPath = path.resolve(__dirname, importPath)
    console.log('importPath', importPath)
    fs.accessSync(importPath)
    if (!Stats.isDir(importPath)) {
      throw new Error('importPath is not dir')
    }
    this._type = type
    this._importPath = importPath
    this._initialize()
  }

  get importPath() {
    return this._importPath
  }
  get type() {
    return this._type
  }

  _initialize() {
    const allFileList = this.getAllFiles(this.importPath).filter(filepath => RegExp(`\.${this.type}$`).test(filepath))
    console.log('allFileList', allFileList)
  }

  getAllFiles(importPath) {
    const list = read(importPath, function(filepath) {
      return filepath[0] !== '.' && !filepath.includes('node_modules')
    })
    return list
  }
}

module.exports = Story
