---
globs:
  - "**/__tests__/**"
  - "apps/web/e2e/**"
  - "apps/web/src/test/**"
---

各テストの責務・検証範囲・テスト名の書き方は [テストガイドライン](https://docs.bi-shop-it.com/llms.mdx/docs/guidelines/testing) に従う。このファイルではプロジェクト固有の設定のみを記載する。

## テストの種類

| 種類 | ツール | 対象 | 配置 |
|---|---|---|---|
| 統合テスト | Vitest | tRPC ルーター（バックエンド全層） | `src/server/api/routers/__tests__/{domain}.test.ts` |
| E2E テスト | Playwright | ユーザー操作フロー（画面） | `e2e/{feature}.test.ts` |

書かないテスト:
- コンポーネントテスト（Testing Library 等）は書かない。画面の検証は E2E で行う

## 統合テストの書き方

`createCaller` で tRPC ルーターを直接呼び出す。HTTP サーバーは起動しない。

### テストデータ

- テスト内で `db.insert()` を使って直接投入する
- 全テーブルの TRUNCATE は `src/test/setup.ts` の `beforeEach` で自動実行されるため、テスト側でのクリーンアップは不要である
- テストデータはファイル先頭に定数として定義する

### 構造

- `describe` はプロシージャ名（`user.list`、`user.create` など）で分ける

## E2E テストの書き方

### テストデータ

- `e2e/seed.ts` でシードデータを投入する。`globalSetup` で実行される
- テストはシードデータが存在する前提で書く
- シードデータの変更が必要な場合は `e2e/seed.ts` を更新する

### 構造

- `test.describe` は機能単位（「ユーザー管理」など）で分ける
- ページ操作には `getByRole`、`getByLabel`、`getByText` などのアクセシブルなセレクタを使う。要素を特定できない場合は `data-testid` を追加するのではなく、UI のアクセシビリティを改善する
