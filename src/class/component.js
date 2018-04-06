const fs = require('fs')
const path = require('path')
const camelcase = requrie('camelcase')

class Component {
  /**
   *
   * @param {String} filepath cmoponent filepath
   */
  constructor(filepath) {
    fs.accessSync(filepath)
    this._filepath = filepath
  }

  getCode() {
    return fs.readFileSync(this.filepath, { encoding: 'utf8' })
  }

  get filepath() {
    return this._filepath
  }

  get componentName() {
    return camelcase(this.name, { pascalCase: true })
  }

  get name() {
    return path.basename(this.filename, this.extname)
  }

  get filename() {
    return path.basename(this.filepath)
  }

  get extname() {
    return path.extname(this.filename)
  }

  get isVue() {
    return this.extname === 'vue'
  }
  get isJsx() {
    return this.extname === 'jsx'
  }
}

module.exports = Component
