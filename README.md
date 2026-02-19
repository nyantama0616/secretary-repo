# nextjs-template2

小中規模の業務システム向け Next.js テンプレート。pnpm workspaces によるモノレポ構成。

## 技術スタック

- Next.js 16 (App Router) + React 19
- TypeScript
- tRPC + TanStack Query
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL 17 (Docker)
- Valibot
- Pino

## 前提条件

- Node.js 22+
- pnpm 10+
- Docker

## プロジェクトの作成

```bash
# 1. テンプレートからリポジトリを作成してクローンする
gh repo create my-project --template nyantama0616/nextjs-template2 --private --clone
cd my-project

# 2. セットアップスクリプトを実行する（プロジェクト名の置換 + pnpm install）
./scripts/setup.sh my-project

# 3. DB を起動してマイグレーションを実行する
docker compose up -d
pnpm --filter web db:migrate

# 4. 開発サーバーを起動する
pnpm dev
```

`setup.sh` は以下を行う:

- `package.json` の `name` をプロジェクト名に置換
- `.env` / `.env.example` の DB 名をプロジェクト名に置換（ハイフンはアンダースコアに変換）
- `pnpm install` の実行

## 構成

```
apps/web/               メインアプリ
packages/ui/             shadcn/ui コンポーネント（@repo/ui）
packages/eslint-config/  共有 ESLint 設定
```

## コマンド

```bash
pnpm dev                       # 開発サーバーを起動する
pnpm build                     # ビルドする
pnpm lint                      # ESLint を実行する
pnpm --filter web test         # 統合テスト（Vitest）を実行する
pnpm --filter web test:e2e     # E2E テスト（Playwright）を実行する
pnpm --filter web db:generate  # Drizzle マイグレーションを生成する
pnpm --filter web db:migrate   # Drizzle マイグレーションを実行する
```
