const fs = require('fs')

class Stats {
  static isExist(path) {
    try {
      fs.accessSync(path)
      return true
    } catch (e) {
      return false
    }
  }
  static _getStat(path) {
    return fs.statSync(path)
  }
  static isDir(path) {
    const stat = this._getStat(path)
    return stat.isDirectory()
  }
  static isDirectory(path) {
    return Stats.isDir(path)
  }
  static isFile(path) {
    const stat = this._getStat(path)
    return stat.isFile()
  }
}

module.exports = Stats
