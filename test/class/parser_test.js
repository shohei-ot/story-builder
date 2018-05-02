const Parser = require('../../src/class/Parser')

const code = `
const test = "hoge"

alert("test")
`

const res = Parser.parse(code)
// console.log('res', res)

const fs = require('fs')
const path = require('path')

fs.writeFileSync(
  path.resolve(__dirname, './test.json'),
  JSON.stringify(res, '', '  '),
  {
    encoding: 'utf8'
  }
)
console.log('done')
