story-builder
=====================

<!-- ![construction](https://camo.githubusercontent.com/f51393d8ca19583234e82bd1f8cf8706a5874971/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f474e764f556742764c7a5677412f67697068792e676966) -->

Storybook の `.storybook/config.js` で読み込むための JavaScript ファイルの基本形を生成します。  
※ 今のところ Vue コンポーネントのみ対応。

## 初期化

```sh
yarn install
# or
npm i
```

## 使い方

コンポーネントを配置しているディレクトリと、出力先ディレクトリを指定してください。

```sh
yarn run builder --in=/path/to/components-dir --out=/path/to/stories-dir
```


### 例

以下のディレクトリ構成の場合の使い方です。

    ┬ .storybook/
    │  ├ config.js
    │  └ story-builder/ (カレントディレクトリ)
    └ resources/
        └ assets/
          └ js/
            ├ components/ (入力元ディレクトリ)
            │  ├ Atoms/
            │  │   └ my-component.vue
            │  ├ Molecules/...
            │  ├ Organisms/...
            │  ├ Templates/...
            │  └ Pages/...
            └ stories/ (出力先ディレクトリ)

上記の構成とディレクトリ位置の場合、パラメータは次のようになります。

- 入力元ディレクトリ (`--in`): `../../resources/assets/js/components`
- 出力先ディレクトリ (`--out`): `../../resources/assets/js/stories`

```sh
yarn run builder --in=../../resources/assets/js/components --out=../../resources/assets/js/stories
```

実行すると以下のファイルが生成されます。

    resources/assets/js/stories/Atoms.js
    resources/assets/js/stories/Molecules.js
    resources/assets/js/stories/Organisms.js
    resources/assets/js/stories/Templates.js
    resources/assets/js/stories/Pages.js

もしも同名のファイルが存在する場合は、ファイル内に存在しないコンポーネントだけがファイルの末尾に追加されます。

### 出力内容

- コンポーネントの `import` 構文の `from` の値は出力ファイルからの相対パスになります。
- 出力コード内でのコンポーネント名はアッパーキャメルケースになります。
  - 例: `my-component.vue` -> `MyComponent`
- `storiesOf` の第一引数は `(Prefix/)?(in配下のディレクトリ名/)*(コンポーネント名)` になります。
  - 例: `storiesOf('Atoms/MyComponent', module)`

## Options

```
  Options:

    -V, --version          output the version number
    -i, --in <path>        コンポーネントディレクトリ (例: `--in=/path/to/components`)
    -o, --out <path>       出力先ディレクトリ (例: `--out=/path/to/stories`)
    -F, --force            出力先が存在する場合に、差分を追加するようにする。
    -p, --prettier <path>  prettier config file path
    -x, --prefix <param>   `sotiresOf()` の第一引数にプレフィックスを付けるようにする。
    -h, --help             output usage information
```
