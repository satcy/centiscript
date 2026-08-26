# (centiscript)

インストール不要でブラウザ上で動く、ライブコーディング風のお絵かき用ミニ言語＆エディタです。短いコードを書いて実行するだけで、アニメーションするビジュアルを2D/3Dで作れます。

## 特徴

- **専用ミニ言語 (centiscript)** — `sz(720,360)bg(0)frame(){clr()col(255)line(0,0,w,h)}` のような短い記法で図形・アニメーションを記述
- **2D描画** — `col()` / `line()` / `rect()` / `oval()` / ベクター(`Vec2`) / 行列(`Matrix`) など、Canvas 2D をラップした一通りの描画API
- **3D描画** — `c3d()` を呼ぶだけで [three.js](https://threejs.org/) (r149) を使った3D描画に切り替え可能
- **オーディオ表現** — `dsp()` で音を合成し、`beat()` / `bpm()` のテンポイベントや `wave` / `fft` を使った音連動表現を書ける
- **ブラウザ内蔵エディタ** — [Monaco Editor](https://microsoft.github.io/monaco-editor/) によるシンタックスハイライト付きの編集・実行
- **GIF録画 / 画像書き出し / JS書き出し** — 作った作品をその場でGIFやPNGとして保存、またはHTMLに組み込めるJSスニペットとして書き出し可能
- **サンプル集・過去作品アーカイブ** — 同梱のサンプルコードや、過去に投稿された作品を一覧・閲覧できる(`full.html?f=作品ID` で単体再生も可能)

## クイックスタート

Web Worker(GIF録画)やローカルファイルの`fetch`(サンプル読み込み・過去作品一覧)を使うため、`file://` で直接開くと一部機能が動きません。リポジトリのディレクトリ直下に移動してから、簡易サーバーを立てて開いてください(直下でないと`samples/`や`archive/tweets.txt`への相対パスが崩れます)。

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開くとエディタが起動します。

> 音を使うスケッチはブラウザの自動再生制限により、ページを開いた直後は無音の場合があります。「▶」ボタンなど画面内をクリックする(ユーザー操作を行う)と`AudioContext`が有効になり、音が鳴るようになります。

## centiscript を書いてみる

```
sz(720,360)bg(0)
frame(){
    clr()
    col(255)
    for(i,0,100){
        line(rnd(w),rnd(h),rnd(w),rnd(h))
    }
}
```

- `sz(w,h)` / `bg(col)` — キャンバスサイズと背景色をセットアップ
- `frame(){...}` — 毎フレーム実行される描画本体
- `beat(){...}` — テンポ(`bpm()`)に合わせて呼ばれる拍イベント
- `dsp(){...}` — オーディオのサンプルごとに呼ばれ、音を合成できる
- 変数への代入は `x=(式)` のように右辺を丸括弧で囲む記法

基本の図形描画APIに加えて、`drawFFT()` / `drawWave()`(音の可視化)、`glitch()` / `mosaic()` / `crash()`(画面エフェクト)、`bmTxt()`(ビットマップフォント文字描画)などの補助APIも用意されています。

左ペイン上部の「Examples」からサンプルコード(`samples/*.ct`)を読み込んで試せます。ローカルの`.ct`ファイルの読み込み・保存にも対応しています。

## プロジェクト構成

```
index.html          エディタ本体(2D/3D対応)
full.html            全画面プレイヤー(?f=作品ID / ?c=コード で外部から作品を読み込み表示)
ss.html               スクリーンセーバー用ページ
js/centi.js           centiscript のパーサー兼描画エンジン本体
js/centi.matrix.js    行列(Matrix)ユーティリティ
js/centi.bitmapFont.js ビットマップフォント描画
js/centiApp.js        エディタUIの制御(実行・保存・GIF録画・書き出しなど)
js/plugin/centi.three.js  3D描画(three.js)連携プラグイン
js/centi.min.js        centi.js のminifyバンドル(kdTree/perlin/Tweenなど同梱)
js/release/            バージョンごとのビルド済みminifyファイル(過去互換用)
samples/               エディタから読み込めるサンプルコード(.ct)
archive/               過去に投稿された作品コード・画像・一覧データ
lib/                   Monaco Editor、three.js などの外部ライブラリ
css/                   スタイルシート
```

## 対応環境

モダンブラウザ(Chrome/Edge/Safari/Firefoxの最新版)を想定しています。GIF録画はWeb Workerを、3D描画はWebGLを利用します。

## ライセンス

[MIT License](LICENSE) — Copyright (c) 2014 Satoshi HORII
