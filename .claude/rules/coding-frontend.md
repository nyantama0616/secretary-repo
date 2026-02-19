---
description: フロントエンドのコーディング規約
globs: apps/*/src/**/*.{ts,tsx}
---

## 関数やコンポーネントの定義順序

抽象->具体の順で定義することで、コードの可読性を上げる。
以下の順で定義すること。

0. Directives: `"use client"` / `"use server"`
1. Imports: ライブラリや別ファイルの読み込み
2. Constants: ファイル全体で使う定数（固定値）
3. Types / Interfaces: 型定義
4. Main Component: このファイルの主役（exportするもの）
5. Sub Components: このファイルだけで使う小さなコンポーネント
6. Helpers / Utils: ロジックだけの純粋関数やhooks

## Server Component / Client Component

CSR メインの設計とする。SEO は重視せず、SSR を使うと実装が複雑になるケースが多いため、SSR によるデータ取得は行わない。

### page.tsx の役割（Server Component）

`page.tsx` は薄い Server Component とし、以下のみを担当する。
- `metadata` / `generateMetadata` によるページタイトルの設定
- `_components/` 内のメインコンポーネントを呼び出す

### _components/ のメインコンポーネント（Client Component）

データ取得・UI・インタラクションはすべて `_components/` 内の Client Component で行う。

### layout.tsx（Server Component）

`layout.tsx` は Server Component のまま維持する。Provider のラップ、フォント設定、metadata template を担当する。

## tRPC の呼び出しパターン

- `useTRPC()` でクライアントを取得し、`useQuery(trpc.xxx.queryOptions())` でデータを取得する
- Mutation 後は `queryClient.invalidateQueries()` で関連キャッシュを無効化する

## スタイリング

- 条件付きクラスの結合には `cn()` (`@/lib/utils`) を使う

## エラー・ローディング表示

- `useQuery` の `isLoading` / `isError` で条件分岐する
- 共通コンポーネント `<Loading />`, `<Error />` (`@/components/feedback/`) を使う

## UI コンポーネント

- shadcn/ui のコンポーネントをベースにする
- 新しいコンポーネントが必要な場合は、まず shadcn のコンポーネントをインストールするだけのコミットを作成し、その後に必要な変更を加える

## コンポーネントの置き場所

- コンポーネントは最初、必要なページの `_components/` に置く
- 複数のページで必要になった時点で `src/components/` に移動する

## コンポーネントの実装
- Props の型名は `ComponentNameProps` とする
- コンポーネントのPropsはインラインではなく、事前にtypeで定義する
  - ただし、プライベートコンポーネントにおいては、Propsをインラインで定義する
- 配置に関する知識（余白・位置）は親コンポーネントが持つべきである
  - コンポーネントの一番外側の要素に margin を付けない
  - `<></>` (Fragment) は原則使わない
