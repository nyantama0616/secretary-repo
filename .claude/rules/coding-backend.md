---
description: バックエンドのコーディング規約
globs: apps/*/src/server/**/*.ts
---

## 関数やクラスの定義順序

抽象->具体の順で定義することで、コードの可読性を上げる。
以下の順で定義すること。

1. Imports: ライブラリや別ファイルの読み込み
2. Constants / Schemas: Valibot スキーマ、設定値などの定数
3. Types / Interfaces: スキーマからの型推論、インターフェース定義
4. Main Export: このファイルの主役（クラス、ルーター、ファクトリ関数など）
5. Helpers: ファイル内でのみ使う変換関数やユーティリティ
