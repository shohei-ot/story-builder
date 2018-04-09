const path = require('path')
const fs = require('fs')
const program = require('commander')
const StoryBuilder = require('../index')

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../package.json'))
)
const version = packageJson.version

program
  .version(version)
  .option(
    '-i, --in <path>',
    'コンポーネントディレクトリ (例: `--in=/path/to/components`)'
  )
  .option(
    '-o, --out <path>',
    '出力先ディレクトリ (例: `--out=/path/to/stories`)'
  )
  .option('-F, --force', '出力先が存在する場合に、差分を追加するようにする。(デフォルトではファイルが既にある場合は何もしない。)')
  .option('-p, --prettier <path>', 'prettier config file path')
  .option('-x, --prefix <param>', '`sotiresOf()` の第一引数にプレフィックスを付けるようにする。')
program.parse(process.argv)

const inPath = program.in
const outPath = program.out
const force = !!program.force
const prettierConfig = program.prettier
const storyPrefix = program.prefix

const Story = StoryBuilder.Story
const Generator = StoryBuilder.Generator

const story = new Story(inPath)
const generator = new Generator(outPath)

if (!!prettierConfig) {
  const prettierConfJson = fs.readFileSync(prettierConfig, { encoding: 'utf8' })
  generator.setPrettierConfig(JSON.parse(prettierConfJson))
}
if(!!storyPrefix){
  generator.setStoryPrefix(""+storyPrefix)
}

generator.run(story, force)

