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


## v0.8 — CROSS → CLOSE
公式ナンバーで、カード拡大中にXがLPの前面に現れ、右上のCLOSEアイコンへ収束します。既存の遷移タイムライン内で実行するため、全体の遷移時間はほぼ同じです。有志ナンバーは従来どおりです。


## v0.9: NUMBER IDENTITY

- 公式: 道 → 大きなX → 左上のXシンボル。
- 有志: 道 → 平行線のモーション → 左上の//シンボル。
- 右上の× CLOSEは独立した閉じるボタンです。
- 既存の慣性スワイプ、カード拡大、詳細LP、逆再生を維持。

## v1.0: 出演者とアクセントカラーの管理

- `src/members.ts`: 出演者ID・表示名・写真URLを一元管理。`photo: "/members/member-001.webp"` のように設定し、画像を `public/members/` に配置できます。
- `src/performances.ts`: 各演目の `members: getMembers(["member-001", ...])` に出演者IDを指定。複数演目への重複出演は同じIDを再利用します。
- `src/accents.ts`: 白・黄色・緑・赤・紫・ピンク・青・オレンジの8色配列。`accent: accents[6].hex` のように選択します（0始まり）。
- デモ用の出演者名・演目名は仮データです。実データに差し替えてください。

## v1.1 — ハの字からX／//へ連続変形

HOMEの道の2本線の画面上の端点を取得し、同じ位置から最前面の2本線へ引き継ぎます。公式は大きなX、有志は大きな//に変形してから、詳細LP左上のシンボルに収束します。カード拡大、慣性スワイプ、members.ts、accents.tsはそのままです。


## v1.2: 左上の重なり修正

サイトヘッダーを上段、X／//シンボルとCLOSEを下段に分離しました。アニメーションの着地点は `.identity-icon` の実際の座標から計算するため、位置変更後も線がシンボルに収束します。iPhone等のセーフエリアにも対応します。

### v1.2.1 CLOSE text only
- Removed the decorative × immediately to the left of CLOSE.
- Kept the CLOSE button, its behavior, and the upper-left X / // identity animation unchanged.
