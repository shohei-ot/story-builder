memo
---

### api

```js
const story = new Story(importPath)
story.generate(exportPath, {force: true})
```


### class

- ComponentSource class
  - コンポーネントのディレクトリに該当するクラス
  - `children: array` に `Component` のインスタンスを配列で持つ。
- Component class
  - 1コンポーネントのModelのためのクラス
- Stories class
  - 1つの出力ファイルのためのクラス
<!-- - Generator
  - 取込+出力するためのクラス -->

#### 定義

- Generator
  <!-- - properties
    - `stories: array`
  - methods
    - `constructor(rootDirPath: string)`
    - `appendStory`
    - `put(): void`
      - 各出力先にファイルを出力する -->
- Story (extends ComponentSource)
  - properties
    - `path: string`
    - `name: string`
    - `children: array`
      - `ComponentSource` のインスタンス、又は `Component` のインスタンスのリスト
  - methods
    - `constructor(directory: string)`
    - `appendChild(): number`
    - `getChildren(): array`
- ComponentSource
  - properties
    - `path: string`
    - `name: string`
    - `parent: ComponentSource`
    - `children: array`
      - `ComponentSource` のインスタンス、又は `Component` のインスタンスのリスト
  - methods
    - `constructor(directory: string)`
    - `appendChild(child: ComponentSource|Component)`
    - `getChildren(): array`
    - `_initChildren`
    - `setParent()`
- Component
  - properties
    - `path: string`
      - file path
    - `name: string`
      - file name
    - `componentName: string`
    - `extname: string`
    - `parent: ComponentSource`
  - methods
    - `setParent()`
    - `constructor(filepath: string)`
    - `getStoryName(): string`
      - parent を辿って `storiesOf` の第一引数に渡すための文字列を作って返す.
