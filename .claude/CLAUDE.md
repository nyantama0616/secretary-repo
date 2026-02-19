# secretary-repo

AI を活用した日報・タスク管理アプリ。先延ばしの解消とモチベーション維持を目的とする。
プロダクトの詳細は `docs/` を参照すること。

pnpm workspaces を使ったモノレポである。

## 技術スタック

- Next.js 16 (App Router)
- React 19
- TypeScript
- tRPC + TanStack Query
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL 17 (Docker)
- Valibot
- Pino

## Apps / Packages

- `apps/web` - メインアプリ
- `packages/ui` - shadcn/ui コンポーネント（`@repo/ui`）
- `packages/eslint-config` - 共有 ESLint 設定

## コマンド

```bash
make dev                              # DB + 開発サーバー + MCP サーバーを起動する（Ctrl+C で全て停止する）
make down                             # DB を停止する
make db                               # DB のみ起動する
make db-down                          # DB を停止し、データも削除する
pnpm build                            # 全アプリをビルドする
pnpm lint                             # 全アプリの ESLint を実行する
pnpm lint:fix                         # 全アプリの ESLint を自動修正する
pnpm --filter web test                # 統合テスト（Vitest）を実行する
pnpm --filter web test:e2e            # E2E テスト（Playwright）を実行する
pnpm --filter web db:generate         # Drizzle マイグレーションを生成する
pnpm --filter web db:migrate          # Drizzle マイグレーションを実行する
```

## 機能の追加・変更時の手順

バックエンドは TDD（テストを先に書く）で進め、フロントエンドは実装後にテストを書く。

1. 統合テストを書く（Red）
2. バックエンドを実装する（Green）
3. リファクタする
4. フロントエンドを実装する
5. E2E テストを書く

## 開発時に注意すること

- `@/` は `apps/web/src/` にマッピングされている
- shadcn/ui コンポーネントは `packages/ui/` にインストールする（`apps/web` ではない）
- 環境変数は `src/config.ts` で一括管理する。`process.env` を直接参照せず、`config.ts` からエクスポートされた値を使う。環境変数を追加・変更した場合は Valibot スキーマも更新する
- URL パスは `src/constants/routes.ts` の ROUTES オブジェクトで管理する

## MCPサーバー

### next-devtools

Next.js開発を支援するMCPサーバー。

- `nextjs_docs` - Next.js公式ドキュメントを取得する
- `nextjs_index` - 起動中の開発サーバーを検出し、利用可能なツールを一覧する
- `nextjs_call` - 開発サーバーのMCPツールを呼び出す（エラー取得、ルート一覧など）
- `browser_eval` - Playwrightによるブラウザ自動化を行う
- `upgrade_nextjs_16` - Next.js 16へのアップグレードをガイドする
- `enable_cache_components` - Cache Componentsモードへの移行を支援する
