dev note
---------------

## 仕様

- ディレクトリを指定して、配下のコンポーネントファイルを1つの stories ファイルにまとめる.
- 


## usage

- cli
- class

### cli

./bin/index.js


### api

```js
const story = new Story(importPath)
story.generate(exportPath, {force: true})
```


### src/class

- importDir
- story
- component
- exportDir