const path = require('path')
const Story = require('../../src/class/story')

// console.log('hoge')
const dirPath = path.resolve(__dirname, 'components')
new Story(dirPath)
