// index.js
const argv = require('argv')
const fs = require('fs')
const path = require('path')
const camelcase = require('camelcase')
const prettier = require('prettier')

// gen tmp dir
const tmpDir = path.resolve(__dirname, '../tmp')
try {
  fs.accessSync(tmpDir)
} catch (e) {
  fs.mkdirSync(tmpDir)
}
const tmpFile = path.resolve(tmpDir, 'tmp.js')
try {
  fs.accessSync(tmpFile)
  fs.unlinkSync(tmpFile)
} catch (e) {}

const argOpts = [
  {
    name: 'in',
    short: 'i',
    type: 'path',
    description: '変換するコンポーネントの配置されているディレクトリ',
    example: '`--in=../components/Atoms` OR `-i ../components/Atoms`'
  },
  {
    name: 'out',
    short: 'o',
    type: 'path',
    description: '出力先ディレクトリ (default: ./export)',
    example: '`--out=../stories` OR `-o ../stories`'
  },
  {
    name: 'force',
    short: 'f',
    type: 'boolean',
    description: '出力先ファイルが存在する場合に上書きする',
    example: '`--fource` OR `-f`'
  },
  {
    name: 'type',
    short: 't',
    type: 'string',
    description: '使用するStorybookの指定 (default: "vue")',
    example: '`--type=react` OR `-t react`'
  },
  {
    name: 'storyprefix',
    short: 'p',
    type: 'string',
    description: '`StoryBook.storiesOf()` の第一引数に入る文字列のプレフィックス',
    example: '`--storyprefix=MyStory/Prefix` OR `-p MyStory/Prefix`'
  }
]

const args = argv.option(argOpts).run()

// console.log('params', params)
const inDir = args.options.in || undefined
if (typeof inDir === 'undefined') {
  console.log('')
  console.log('> Error!')
  console.log('> Required param: "--in={import directory path}"')
  console.log('')
  return false
}
fs.accessSync(inDir)
const inDirName = path.basename(inDir)

// console.log('inDir', inDir)
const defaultOutDir = path.resolve(__dirname, '../export')
try {
  fs.accessSync(defaultOutDir)
} catch (e) {
  fs.mkdirSync(defaultOutDir)
}
const outDir = args.options.out || defaultOutDir
// console.log('outDir', outDir)
if (outDir !== defaultOutDir) {
  fs.accessSync(outDir)
}

const type = ['vue', 'react'].includes(args.options.type) ? args.options.type : 'vue'
const storyPrefix = args.options.storyprefix || ''
const force = args.options.force || false
// console.log("force",force)

// import + convert + export
const componentExtensions = ['.vue', '.jsx']
const fileNameList = fs.readdirSync(inDir).filter(name => name[0] !== '.' && componentExtensions.some(v => new RegExp(`.+${v}$`).test(name)))
console.log('fileNameList', fileNameList)

const resolveComponentPath = componentPath => {
  return path.relative(outDir, componentPath)
}

const componentList = [
  // {
  //   name: string (file path),
  //   path: string (absolute path),
  //   resolvedPath: string (resolved path from outDir)
  // }
]

for (const name of fileNameList) {
  const _names = name.split('.')
  const nameWithoutExt = _names[0]
  const ext = _names[1]
  const absPath = path.resolve(inDir, name)
  const resolvedPath = resolveComponentPath(absPath)
  const pascalCase = camelcase(nameWithoutExt, {
    pascalCase: true
  })
  componentList.push({
    name,
    ext,
    pascalCase,
    path: absPath,
    resolvedPath
  })
}

// console.log("componentList", componentList);

const storiesFileName = inDirName + '.js'
const storiesFilePath = path.resolve(outDir, storiesFileName)
try {
  if (!force) {
    fs.accessSync(storiesFilePath)
    // console.log("can access: " + storiesFilePath);
    console.log('')
    console.log('> Error')
    console.log(`${storiesFileName} が既に存在します.`)
    console.log('')
    return false
  }
} catch (e) {
  // console.log("can NOT access: " + storiesFilePath);
}

const storyHeader = `import {storiesOf} from '@storybook/${type}';`

const writeOptions = {
  flag: 'a+'
}
fs.writeFileSync(tmpFile, storyHeader, writeOptions)

// import syntax
for (const info of componentList) {
  fs.writeFileSync(tmpFile, `import ${info.pascalCase} from '${info.resolvedPath}';`, writeOptions)
}

fs.writeFileSync(tmpFile, '\n\n', writeOptions)

// storiesOf syntax
for (const info of componentList) {
  const storyNamePieces = storyPrefix.split('/').filter(v => !!v)
  storyNamePieces.push(inDirName)
  storyNamePieces.push(info.pascalCase)
  const storyName = storyNamePieces.join('/')
  const storiesOfScript = `
storiesOf('${storyName}', module).add('default', () => {
  return {
    components: {${info.pascalCase}},
    template: \`<${info.pascalCase}></${info.pascalCase}>\`
  }
});
  `
  fs.writeFileSync(tmpFile, storiesOfScript, writeOptions)
}

const code = fs.readFileSync(tmpFile, { encoding: 'utf8' })
const prettierOptions = {
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  trailingComma: 'none',
  bracketSpacing: true,
  jsxBracketSameLine: true,
  arrowParens: 'avoid'
}
const prettieredCode = prettier.format(code, prettierOptions)
if (force) {
  fs.writeFileSync(storiesFilePath, '', { flag: 'w+' })
}
fs.writeFileSync(storiesFilePath, prettieredCode, writeOptions)
try {
  fs.accessSync(tmpFile)
  fs.unlinkSync(tmpFile)
} catch (e) {}

console.log('')
console.log('> Done!')
console.log('> ' + storiesFilePath)
console.log('')

return true
