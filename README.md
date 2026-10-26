# Next grooove 2026 — Photo card

ユーザー提供の `App.tsx` をベースに、カード右側の集合写真と暗色グラデーションを追加しました。

## 起動
`npm install` → `npm run dev`

## 集合写真
`public/covers/M01.webp` などに画像を置き、`src/performances.ts` に `cover: "/covers/M01.webp"` と `coverPosition: "65% center"` を設定してください。

`src/texts.ts` は元コードの `texts` 参照を満たすための仮テキストです。既存のテキスト設定がある場合は置き換えてください。

データはサンプルです。メンバー・演目は本番用データへ差し替えてください。

## v1.4.1 カード写真のカラー融合
各カードの `--accent` から `--card-tone` を生成し、カード背景と写真左側のグラデーションに同じ色を使用します。8色のアクセントに自動追従します。`App.tsx` やスワイプ動作は変更していません。
