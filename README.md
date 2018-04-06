story-builder
=====================

Generate Stories file for Storybook.

![construction](https://camo.githubusercontent.com/f51393d8ca19583234e82bd1f8cf8706a5874971/68747470733a2f2f6d656469612e67697068792e636f6d2f6d656469612f474e764f556742764c7a5677412f67697068792e676966)

## Initialize

```sh
yarn install
# or
npm i
```

## Usage (cli)

```sh
yarn run builder --in=/path/to/my-components-dir --out=/path/to/my-stories-dir
```

### result



## options

```
	--help, -h
		Displays help information about this script
		'index.js -h' or 'index.js --help'

	--in, -i
		変換するコンポーネントの配置されているディレクトリ
		`--in=../components/Atoms` OR `-i ../components/Atoms`

	--out, -o
		出力先ディレクトリ (default: ./export)
		`--out=../stories` OR `-o ../stories`

	--force, -f
		出力先ファイルが存在する場合に上書きする
		`--fource` OR `-f`

	--type, -t
		使用するStorybookの指定 (default: "vue")
		`--type=react` OR `-t react`

	--storyprefix, -p
		`StoryBook.storiesOf()` の第一引数に入る文字列のプレフィックス
		`--storyprefix=MyStory/Prefix` OR `-p MyStory/Prefix`
```
