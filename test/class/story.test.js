const path = require('path')
// const Story = require('../../src/class/story')
const Story = require('../../src/class/story')

test('story initialize', () => {
  const story = new Story(path.resolve(__dirname, '../dev/components/'))
  const filelist = story.getAllFiles(story.importPath)
  expect(filelist).toEqual(expect.arrayContaining(['Atoms/vue-atom.vue', 'Molecules/vue-molecules.vue']))
})
