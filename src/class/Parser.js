const babylon = require('babylon')

class Parser {
  static parse(code) {
    return babylon.parse(code)
  }
}

module.exports = Parser
