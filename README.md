# miraktest-plugins

[MirakTest](https://github.com/ci7lus/MirakTest) で使えるプラグイン集です。

## 導入方法

1. MirakTest の設定画面を開きます
1. プラグインディレクトリを開きます
   [![Image from Gyazo](https://i.gyazo.com/9fe5c2df3e3b16ee3e1c799b02b06394.jpg)](https://gyazo.com/9fe5c2df3e3b16ee3e1c799b02b06394)
1. 導入したいプラグインの js ファイルをディレクトリの中に入れます
   [![Image from Gyazo](https://i.gyazo.com/3986b1775fe4faf768f789304137f836.png)](https://gyazo.com/3986b1775fe4faf768f789304137f836)
1. MirakTest を再起動します
1. Enjoy!

## プラグインのダウンロード

コミット毎に [Releases](https://github.com/ci7lus/miraktest-plugins/releases) に放流されます。

## プラグイン一覧

- [Sample](./src/miraktest-sample)<br />
  テスト用プラグインです。実用的な機能は含んでいません。
- [Discord RPC](./src/miraktest-drpc)<br />
  (v1 標準機能代替) Discord に番組情報を連携表示するプラグインです。
- [Saya](./src/miraktest-saya)<br />
  (v1 標準機能代替) Saya と連携し、視聴中のサービスに関するコメントを取得します。コメントの表示には DPlayer プラグインが必要です。
- [DPlayer](./src/miraktest-dplayer)<br />
  (v1 標準機能代替) Saya プラグインと連携し、コメントを表示します。
- [EPGStation](./src/miraktest-epgs)<br />
  EPGStation(v2) と連携し、録画番組を再生します。
- [Annict](./src/miraktest-annict)<br />
  Annict と連携し、視聴中のアニメを記録します。
- [Miyou](./src/miraktest-miyou)<br />
  Miyou から視聴中の録画番組のコメントを取得します。コメントの表示には DPlayer プラグインが必要です。
- [Nico](./src/miraktest-nico)<br />
  ニコニコ生放送から視聴中の番組に関するコメントを、ニコニコ実況（過去ログ API）から視聴中の録画番組のコメントを取得します。コメントの表示には DPlayer プラグインが必要です。
- [Gyazo](./src/miraktest-gyazo)<br />
  スクリーンショットを Gyazo にアップロードします。
- [Twitter](./src/miraktest-twitter)<br />
  視聴中の番組に関連するツイートを投稿します。
- [Local](./src/miraktest-local/)<br />
  ローカルファイルの再生を行います。
- [rmcn](./src/miraktest-rmcn/)<br />
  リモコン用のWebSocketが生えます。
- [GDrive](./src/miraktest-gdrive/)<br />
  Google Drive上の動画ファイルの再生を行えます。

## ビルド

```bash
git clone git@github.com:ci7lus/miraktest-plugins.git
cd miraktest-plugins
yarn
yarn build
yarn build --env=files=miraktest-annict # miraktest-annictだけをビルドする
```

`./dist` の中に js ファイルが生成されます。

## プラグインの開発

このプロジェクトを参考によしなにやってください。<br />
`plugin.d.ts` は[合致する MirakTest の Release](https://github.com/ci7lus/MirakTest/releases) からダウンロードできます。

## 謝辞

miraktest-plugins は次のプロジェクトを利用/参考にして実装しています。

- [Chinachu/Chinachu](https://github.com/Chinachu/Chinachu)
- [SlashNephy/saya](https://github.com/SlashNephy/saya)
- [tsukumijima/TVRemotePlus](https://github.com/tsukumijima/TVRemotePlus)

DTV コミュニティの皆さまに感謝します。

## ライセンス

miraktest-plugins は MIT ライセンスの下で提供されますが、依存によって別のライセンスが適用される場合があります。<br />
ファイル内にライセンスが記載されている場合、それが優先して適用されます。
