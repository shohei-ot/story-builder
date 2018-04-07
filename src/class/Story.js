const ComponentSource = require('./ComponentSource')

class StoryRoot extends ComponentSource {
  constructor(dirpath) {
    super(dirpath)
  }
  get root() {
    return true
  }
}

module.exports = StoryRoot
