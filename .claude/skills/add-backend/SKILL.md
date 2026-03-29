---
name: add-backend
description: バックエンドを TDD の手順に沿って追加する
argument-hint: [機能の説明]
---

# バックエンド実装: $ARGUMENTS

以下の手順でバックエンドを実装する。

**重要: 各ステップの完了時にユーザーの承認を得てからコミットする。承認なしにコミットや次のステップへの移行を行ってはならない。**

## 1. Domain 層を設計する

エンティティ（Valibot スキーマ + brand）、Repository インターフェース、ドメインエラーを定義する。

→ そのまま次へ進む。

## 2. 結合テストを書く（Red）

- [テストガイドライン](https://docs.bi-shop-it.com/llms.mdx/docs/guidelines/testing) を読み、結合テストの責務・検証範囲・テスト名の書き方を確認する
- `src/server/api/routers/__tests__/` に結合テストを作成する
- テストを実行し、失敗することを確認する

```bash
pnpm --filter web test
```

→ 承認を得てから `--no-verify` でコミットする。Red フェーズでは未実装の型を参照するため `tsc --noEmit`（pre-commit hook）が通らない。これは例外的な措置であり、通常は `--no-verify` を使ってはならない。

## 3. バックエンドを実装する（Green）

ステップ1で定義した Domain 層をベースに、残りの層を以下の順で実装する:

1. **UseCase 層**: Domain の Repository インターフェースに依存し、クラスとして定義する。UseCase はユーザーの意図ごとに用意する
2. **Infrastructure 層**: Domain の Repository インターフェースを実装し、DI コンテナに登録する
3. **API 層**: tRPC ルーターで UseCase を呼び出す

テストを実行し、すべて通ることを確認する。

```bash
pnpm --filter web test
```

→ そのまま次へ進む。

## 4. コードレビュー

`/review-coding` を実行し、フィードバックに応じて修正する。テストが通る状態を維持すること。

→ 承認を得てからコミットする。
