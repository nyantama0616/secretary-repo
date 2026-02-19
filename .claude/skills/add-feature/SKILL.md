---
name: add-feature
description: 新しい機能を TDD の手順に沿って追加する
argument-hint: [機能の説明]
---

# 機能追加: $ARGUMENTS

以下の手順で機能を追加する。各ステップを完了してから次に進むこと。

## 1. Domain 層を設計する

エンティティ（Valibot スキーマ + brand）、Repository インターフェース、ドメインエラーを定義する。
実装に進む前に、ユーザーに設計内容を提示して承認を得ること。

## 2. 統合テストを書く（Red）

- `src/server/api/routers/__tests__/` に統合テストを作成する
- 正常系を最低1ケース、異常系はドメインエラーを返すパスをすべてカバーする
- テストを実行し、失敗することを確認する

```bash
pnpm --filter web test
```

## 3. バックエンドを実装する（Green）

ステップ1で定義した Domain 層をベースに、残りの層を以下の順で実装する:

1. **UseCase 層**: Domain の Repository インターフェースに依存し、クラスとして定義する
2. **Infrastructure 層**: Domain の Repository インターフェースを実装し、DI コンテナに登録する
3. **API 層**: tRPC ルーターで UseCase を呼び出す

テストを実行し、すべて通ることを確認する。

```bash
pnpm --filter web test
```

## 4. リファクタする

テストが通る状態を維持しつつ、コードを整理する。

バックエンドの実装が完了した時点で、ユーザーにレビューを依頼すること。

## 5. UI を提案する

`dev/<feature>/page.tsx` にモックページを作成し、UI の構成をユーザーに提示する。
承認を得てから次のステップに進むこと。

## 6. フロントエンドを実装する

以下の順で実装する:

1. **page.tsx**（Server Component）: `metadata` の設定と `_components/` 内のメインコンポーネントの呼び出しのみ
2. **_components/ のメインコンポーネント**（Client Component）: データ取得・UI・インタラクションを担当する
3. **UI コンポーネント**: shadcn/ui をベースにする。新しい shadcn コンポーネントが必要な場合は、`packages/ui/` へのインストールのみを単独のコミットとして作成してから、実装に進む

## 7. E2E テストを書く

- `e2e/` に機能単位で E2E テストを作成する
- 必要に応じて `e2e/seed.ts` にシードデータを追加する
- テストを実行し、すべて通ることを確認する

```bash
pnpm --filter web test:e2e
```
