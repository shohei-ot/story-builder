const fs = require('fs')
const path = require('path')

const prettierConfig = fs.readFileSync(
  path.resolve(__dirname, '../../.prettierrc.json')
)

const Story = require('../../src/class/Story')
const Generator = require('../../src/class/Generator')

const dirPath = path.resolve(__dirname, 'components/')
const outputDir = path.resolve(__dirname, 'stories')

const story = new Story(dirPath)
const generator = new Generator(outputDir)

generator.setPrettierConfig(JSON.parse(prettierConfig))
generator.run(story, true)
