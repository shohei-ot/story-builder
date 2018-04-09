const path = require('path')
const fs = require('fs')
const prettier = require('prettier')
const read = require('fs-readdir-recursive')

const Stats = require('../lib/Stats')
const StoryRoot = require('./Story')

class Generator {
  constructor(outputDir, type = 'vue') {
    if (!Stats.isExist(outputDir) || !Stats.isDir(outputDir)) {
      throw new Error('outputDir is not exist')
    }

    this._type = type
    this._outputDir = outputDir
    this._storyPrefix = []
    this._prettier = {}

    // ref: Generate a random string in JavaScript In a short and fast way! https://gist.github.com/6174/6062387
    this._tmpHash =
      Math.random()
        .toString(36)
        .substring(2, 15) +
      Math.random()
        .toString(36)
        .substring(2, 15)
  }

  setPrettierConfig(option) {
    this._prettier = JSON.parse(JSON.stringify(option))
  }

  get type() {
    switch (this._type) {
      case 'vue':
        return 'vue'
      case 'jsx':
        return 'jsx'
      default:
        throw new Error('invalid component type: ' + this._type)
    }
  }
  setType(type) {
    this._type = type
  }

  /**
   * story file を出力する.
   * @param {Story} story
   */
  run(story, overwrite = false) {
    this.initTmpDir()
    try {
      const componentList = story.getAllComponent()

      // init story files
      const storyFileNameList = []
      for (const component of componentList) {
        const storyFileName = this._resolveJsExt(
          this.getStoryFileName(component)
        )
        if (!storyFileNameList.includes(storyFileName)) {
          storyFileNameList.push(storyFileName)
        }
      }
      for (const filename of storyFileNameList) {
        this.initTmpFile(filename)
      }
      // init story files / end

      // import, storiesOf 構文チェックとコードの追記
      for (const component of componentList) {
        const storyFileName = this._resolveJsExt(
          this.getStoryFileName(component)
        )
        const tmpFilePath = this.genTmpStoryFilePath(storyFileName)
        if (!this.isExistImportSyntax(tmpFilePath, component)) {
          this.insertImportSyntax(tmpFilePath, component)
        }
        if (!this.isExistStoriesOfSyntax(tmpFilePath, component)) {
          this.appendStoriesOfSyntax(tmpFilePath, component)
        }
      }

      // 一時ファイルを出力先ファイルへ書き出す
      const outputedFilePathList = []
      for (const filename of storyFileNameList) {
        const tmpFilePath = this.genTmpStoryFilePath(filename)
        const outputFilePath = this.genOutputStoryFilePath(filename)
        if (Stats.isExist(outputFilePath) && !overwrite) {
          console.log('Already exists: ' + outputFilePath)
        } else {
          this.fileToFile(tmpFilePath, outputFilePath)
          outputedFilePathList.push(outputFilePath)
        }
      }

      // console.log('after write output')

      console.log('\n' + 'Outputs:')
      if (outputedFilePathList.length) {
        outputedFilePathList.forEach(p => {
          console.log('> ' + p)
        })
      } else {
        console.log('> none')
      }
      console.log('\n' + '✨  Done!😊')
    } catch (e) {
      console.log('❌  Failed!')
      console.log(e)
    }
    this.unlinkTmpDir()
  }

  get prettier() {
    return JSON.parse(JSON.stringify(this._prettier))
  }

  setStoryPrefix(prefix) {
    this._storyPrefix = prefix
  }

  get storyPrefix() {
    const prefixList = []
    let tmp = []
    if (Array.isArray(this._storyPrefix)) {
      tmp = this._storyPrefix
    } else {
      tmp = ('' + this._storyPrefix).split('/')
    }
    if (tmp.length === 0) {
      return ''
    }
    for (const p of tmp) {
      prefixList.push(p)
    }
    return prefixList.join('/') + '/'
  }

  /**
   * @return {String}
   */
  get outputDir() {
    return this._outputDir
  }

  /**
   * @return {String}
   */
  get tmpDir() {
    return path.resolve(this.outputDir, 'tmp_' + this._tmpHash)
  }

  /**
   * 出力先一時ファイルを初期化する. 既に存在する場合は空にする.
   *
   * @param {String} storyFileName
   */
  initTmpFile(storyFileName) {
    const tmpFilePath = this.genTmpStoryFilePath(storyFileName)
    if (Stats.isExist(tmpFilePath)) {
      fs.unlinkSync(tmpFilePath)
    }
    // 出力済ファイルがあれば取り込み
    if (this._isExistOutputFile(storyFileName)) {
      // 一時ファイルに書き込み
      const outputFilePath = this.genOutputStoryFilePath(storyFileName)
      this.fileToFile(outputFilePath, tmpFilePath)

      // storiesOf が無ければ追加する
      const tmpFileCode = fs.readFileSync(tmpFilePath, {
        encoding: 'utf8'
      })
      const hasImportStoriesOf = /import\s*\{\s*storiesOf\s*\}\s*from\s*('|")@storybook\//.test(
        tmpFileCode
      )
      if (!hasImportStoriesOf) {
        fs.writeFileSync(
          tmpFilePath,
          `import { storiesOf } from '@storybook/${this.type}'\n${tmpFileCode}`,
          { encoding: 'utf8', flag: 'w' }
        )
      }
    } else {
      const importStoriesOfCode = `import { storiesOf } from '@storybook/${
        this.type
      }'\n`
      fs.writeFileSync(tmpFilePath, importStoriesOfCode, {
        encoding: 'utf8',
        flag: 'w'
      })
    }
  }

  genOutputStoryFilePath(storyFileName) {
    return path.resolve(this.outputDir, this._resolveJsExt(storyFileName))
  }
  genTmpStoryFilePath(storyFileName) {
    return path.resolve(this.tmpDir, this._resolveJsExt(storyFileName))
  }

  _isExistOutputFile(storyFileName) {
    const outputPath = this.genOutputStoryFilePath(storyFileName)
    return Stats.isExist(outputPath) && Stats.isFile(outputPath)
  }

  /**
   * 出力先ディレクトリを基準とした、コンポーネントの相対パスを返す.
   *
   * @param {String} componentPath
   * @return {String}
   */
  genRelativeComponentPath(componentPath) {
    return path.relative(this.outputDir, componentPath)
  }

  /**
   * 出力先ディレクトリに配置するファイル名を配列で返す.
   *
   * @param {StoryRoot} story
   * @return {String[]}
   */
  genStoryFileNames(story) {
    const rootFileNameList = []
    const allComponents = story.getAllComponent()
    for (const component of allComponents) {
      const name = this.getStoryFileName(component)
      if (!rootFileNameList.includes(name)) {
        rootFileNameList.push(name)
      }
    }
    return rootFileNameList
  }

  getStoryFileName(component) {
    const name = component.getStoryName()
    const namePieces = name.split('/')
    return namePieces[0]
  }

  /**
   * 出力先ファイルのチェック
   *
   * @param {String} storyFileName
   * @return {Boolean}
   */
  checkOutputStoryFile(storyFileName) {
    storyFileName = this._resolveJsExt(storyFileName)
    const outputFilePath = path.resolve(this.outputDir, storyFileName)
    return Stats.isExist(outputFilePath)
  }

  /**
   * StoryFileName に属するコンポーネントを返す
   * @param {String} storyFileName `genStoryFileName()` で返る値の1つ
   * @param {Story} story
   * @return {Array}
   */

  getStoryComponent(storyFileName, story) {
    const componentList = []
    const allComponents = story.getAllComponent()
    for (const comp of allComponents) {
      if (new RegExp(`^${storyFileName}`).test(comp.getStoryName())) {
        componentList.push(comp)
      }
    }
    return componentList
  }

  /**
   * 引数の文字列末尾に `".js"` が無ければ追加して返す。あったらそのまま返す。
   *
   * @param {String} name
   * @return {String}
   */
  _resolveJsExt(name) {
    if (!/\.js$/.test(name)) {
      name = `${name}.js`
    }
    return name
  }

  /**
   * JSファイルの中身をフォーマットしつつ別のファイルへコピーする.
   *
   * @param {String} inputFilePath   取込元ファイル
   * @param {String} outputFilePath  出力先ファイル
   * @param {Boolean} append         (optional) 上書きせず末尾に追加する (デフォルト: false)
   * @return {Boolean}
   */
  fileToFile(inputFilePath, outputFilePath, append = false) {
    if (!Stats.isExist(inputFilePath)) {
      throw new Error('no exist input file: ' + inputFilePath)
    }
    if (!Stats.isExist(outputFilePath)) {
      // throw new Error('no exist output file: ' + outputFilePath)
      fs.writeFileSync(outputFilePath, '', { encoding: 'utf8', flag: 'w+' })
    }
    const inputFileCode = fs.readFileSync(inputFilePath, {
      encoding: 'utf8'
    })
    const formattedCode = prettier.format(inputFileCode, this.prettier)
    fs.writeFileSync(outputFilePath, formattedCode, {
      encoding: 'utf8',
      flag: append ? 'a+' : 'w'
    })
    return true
  }

  insertImportSyntax(filepath, component) {
    const importSyntaxCode = this.genComponentImportSyntax(component)
    const origCode = fs.readFileSync(filepath, {
      encoding: 'utf8'
    })
    let replacedCode = ''
    const matched = origCode.match(/^import\s+[^\n]+/g)
    if (matched !== null && matched.length) {
      // console.log('matched', matched)
      const lastImportSyntax = matched[matched.length - 1]
      replacedCode = origCode.replace(
        lastImportSyntax,
        `${lastImportSyntax}\n${importSyntaxCode};`
      )
    } else {
      replacedCode = importSyntaxCode + ';'
    }
    fs.writeFileSync(filepath, replacedCode, {
      encoding: 'utf8',
      flag: 'w+'
    })
  }

  appendStoriesOfSyntax(filepath, component) {
    const storiesOfSyntaxCode = this.genStoriesOfSyntax(component)
    const origCode = fs.readFileSync(filepath, {
      encoding: 'utf8'
    })
    fs.writeFileSync(filepath, `${origCode}\n${storiesOfSyntaxCode}`, {
      encoding: 'utf8',
      flag: 'w+'
    })
  }

  /**
   * `import ...` 構文の配列を生成する.
   *
   * @param {Array} components
   * @return {Array}
   */
  genComponentImportSyntaxList(components) {
    const syntaxList = []
    for (const item of components) {
      syntaxList.push(this.genComponentImportSyntax(item))
    }
    return syntaxList
  }
  genComponentImportSyntax(component) {
    return `import ${
      component.componentName
    } from '${this.genRelativeComponentPath(component.path)}'
    `
  }

  // genStoriesOfSyntaxList(components: array): string
  genStoriesOfSyntaxList(components) {
    const syntaxList = []
    for (const item of components) {
      syntaxList.push(this.genStoriesOfSyntax(item))
    }
    return syntaxList
  }

  genStoriesOfSyntax(component) {
    const storyPrefix = this.storyPrefix
    return `storiesOf('${storyPrefix + component.getStoryName()}', module)\n
  .add('default', () => {
    return {
      components: {${component.componentName}},
      template: \`<${component.componentName}></${component.componentName}>\`
    }
  })\n`
  }

  genBasicStorySyntaxList(components) {
    const importSyntaxList = this.genComponentImportSyntaxList(components)
    const storiesOfSyntaxList = this.genStoriesOfSyntaxList(components)
  }

  isExistImportSyntax(outputFilePath, component) {
    if (!Stats.isExist(outputFilePath)) return false
    const code = fs.readFileSync(outputFilePath, {
      encoding: 'utf8'
    })
    const componentName = component.componentName
    return new RegExp(`import ${componentName} from`).test(code)
  }

  isExistStoriesOfSyntax(outputFilePath, component) {
    if (!Stats.isExist(outputFilePath)) return false
    const code = fs.readFileSync(outputFilePath, {
      encoding: 'utf8'
    })
    const storyPrefix = this.storyPrefix
    const storyName = component.getStoryName()
    const fullStoryName = (storyPrefix + storyName).replace(/\//gm, '\\/')
    const regExpStr = `storiesOf\\s*\\(\\s*(\\'|\\")${fullStoryName}(\\'|\\")\\s*,\\s*module\\s*`
    return new RegExp(regExpStr).test(code)
  }

  initTmpDir() {
    try {
      fs.accessSync(this.tmpDir)
    } catch (e) {
      fs.mkdirSync(this.tmpDir)
    }
    return true
  }

  unlinkTmpDir() {
    const tmpFileList = read(this.tmpDir)
    for (const tmpFile of tmpFileList) {
      const tmpDirFilePath = path.resolve(this.tmpDir, tmpFile)
      if (Stats.isExist(tmpDirFilePath)) {
        fs.unlinkSync(tmpDirFilePath)
      }
    }
    if (Stats.isExist(this.tmpDir) && Stats.isDir(this.tmpDir)) {
      fs.rmdirSync(this.tmpDir)
    }
  }

  removeTmpDir() {
    try {
      fs.accessSync(this.tmpDir)
    } catch (e) {
      return true
    }
    fs.unlinkSync(this.tmpDir)
    return true
  }
}

module.exports = Generator
