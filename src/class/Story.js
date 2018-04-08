const ComponentSource = require('./ComponentSource')

class StoryRoot extends ComponentSource {
  constructor(importDir) {
    if (typeof importDir === 'undefined') {
      throw new Error('reuqire importDir')
    }
    super(importDir)
  }

  /**
   * 配下に持つ全ての Component のインスタンスを並列な配列で返す
   *
   * @return {Component[]}
   */
  getAllComponent() {
    const components = []
    let searchList = this.children
    while (searchList.length) {
      const _searchListTmp = []
      for (const item of searchList) {
        if (item.isComponent()) {
          components.push(item)
        } else {
          for (const child of item.children) {
            _searchListTmp.push(child)
          }
        }
      }
      searchList = _searchListTmp
    }
    return components
  }
}

module.exports = StoryRoot
