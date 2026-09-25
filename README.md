# NEXT GROOOVE 2026 — BEYOND THE LINES

React + Vite + TypeScript + GSAP のデジタルパンフレット・プロトタイプ。

## 起動

```bash
npm install
npm run dev
```

## 操作

1. HOMEの「EXPLORE THE NUMBERS」で演目一覧へ。
2. 上下スワイプ、マウスドラッグ、マウスホイールでカードを道に沿って切り替え。
3. 手前の濃いカードをタップすると、公式は「道→X→LP」、有志は「道が開く→LP」。
4. LPは紹介文、講師、メンバー写真を縦スクロールで閲覧。CLOSEで逆再生してHOMEに戻る。

演目と画像URLは `src/performances.ts` を編集してください。写真は未設定時プレースホルダーです。

アクセシビリティ: OSの「視差効果を減らす」設定時はアニメーションをスキップします。


## v0.5 遠近感のあるカードスタック
上スワイプでアクティブカードが水平線へ進み、直前の2枚は奥に残ります。3枚目以降は非表示です。アクティブカードのみタップ可能で、公式ナンバーは道→X→LP、有志ナンバーは道が開いてLPへ遷移します。


## v0.6 慣性スワイプ
スマホは指の移動に追従し、指を離すと速度に応じて進んで最寄りのカードに吸着します。PCはマウスドラッグ、ホイール、上下矢印キーに対応。通過済みカードは水平線方向に最大2枚残り、アクティブカードだけタップできます。

## v0.7 — card-to-LP transition
- Pointer-up distinguishes tap from drag even with pointer capture (mobile Safari/Chrome).
- The tapped card's actual screen bounds seed the LP clip-path; LP expands from the card to full screen.
- Official: road becomes X while card expands. Voluntary: road opens while card expands.
- CLOSE reverses the same animation and restores the selected card and inertial swipe.

## v0.7.1 tap fix
Pointer capture starts only after 7px of actual drag; ordinary taps retain the native button click. Taps no longer trigger a snap animation. The LP overlay receives pointer events during its opening animation.
