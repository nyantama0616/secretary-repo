---
paths:
  - "apps/*/src/server/**/*.ts"
---

> 各アプリの `src/server/` 配下のバックエンドコードに適用する

## バックエンドアーキテクチャ

クリーンアーキテクチャに基づく4層構成である。

### レイヤー構成

```
API → UseCase → Domain ← Infrastructure
```

- Domain 層は他のレイヤーに依存しない
- Infrastructure は Domain のインターフェースを実装する（依存性逆転）

### 各層の責務

#### Domain 層 — ビジネスの本質を表現する
- ビジネスルールとエンティティの定義を担う
- 「何が正しいデータか」「何が不正な状態か」をバリデーションとドメインエラーで表現する
- フレームワークや外部技術に一切依存しない。最も安定したレイヤーである

#### UseCase 層 — アプリケーション固有の操作を実行する
- 「ユーザーが何をしたいか」をひとつの操作として表現する
- Domain 層のエンティティと Repository インターフェースを組み合わせてロジックを実行する
- 1 クラス 1 操作を原則とする

#### Infrastructure 層 — 技術的な詳細を実装する
- Domain 層で定義された Repository インターフェースの具体的な実装を提供する
- 外部サービス・DB・API との接続を担う
- DI コンテナで UseCase と Repository 実装を結合する

#### API 層 — 外部とのインターフェースを担う
- クライアントからのリクエストを受け取り、UseCase に委譲する
- 入出力の変換（バリデーション、シリアライズ）を行う
- ビジネスロジックを持たない。あくまで UseCase への橋渡しである

### 各層のルール

#### Domain 層
- エンティティは Valibot スキーマ + `v.brand()` で定義する
- Repository はインターフェース（`interface`）として定義する
- ID は `domain/id.ts` の `generateId()` で生成する（nanoid）。UUID は使わない

#### UseCase 層
- クラスとして定義し、`execute()` メソッドで実行する
- コンストラクタで Repository インターフェースを受け取る（コンストラクタインジェクション）
- 入力スキーマは UseCase が Valibot で定義・export する。API 層はそのスキーマを import してバリデーションに使う

#### Infrastructure 層
- `di/container.ts` で UseCase とその依存を組み立てる
- Repository の実装は `infrastructure/` 配下に置く

#### API 層
- tRPC ルーターは UseCase を呼び出すだけ。ビジネスロジックを持たない
- ドメインエラーから `TRPCError` への変換は `trpc.ts` の middleware が行う

### 認証

共有 API Key 方式のシングルユーザー認証である。認証ロジックは `server/api/auth.ts` に集約する。

#### フロー

1. ユーザーがログインフォームに API Key を入力する
2. `POST /api/auth/login` で環境変数 `API_KEY` と照合する（SHA-256 + `timingSafeEqual`）
3. 認証成功時、API Key を Cookie（httpOnly, secure, sameSite=lax）に保存する
4. tRPC ハンドラが Cookie から API Key を抽出・検証し、`isAuthenticated` を tRPC コンテキストに設定する

#### 認証の検証ポイント

- **Next.js middleware**（`src/middleware.ts`）: Cookie の存在を確認し、未認証なら `/login` へリダイレクトする
- **tRPC HTTP ハンドラ**（`src/app/api/trpc/[trpc]/route.ts`）: Cookie の API Key を検証し、tRPC コンテキストに `isAuthenticated` を設定する
- **createServerCaller**（`server/api/index.ts`）: Server Component 用。Cookie の API Key を検証し、HTTP ハンドラと同じ認証ロジックを適用する
- **protectedProcedure**（`server/api/trpc.ts`）: `isAuthenticated: false` なら `TRPCError(UNAUTHORIZED)` を throw する

#### ルール

- 認証が必要な tRPC プロシージャは `protectedProcedure` を使う
- 認証ロジック（検証・抽出）は `server/api/auth.ts` に閉じる。ルーターや UseCase に認証の詳細を漏らさない
- 環境変数 `API_KEY` は `config.ts` 経由で参照する

### エラーハンドリング

#### Domain 層
- ビジネスルール違反は `DomainError` のサブクラスを throw する
- ドメイン固有のエラークラスは作らず、汎用的なエラー（`NotFoundError`, `ValidationError`, `AlreadyExistsError` など）を定義し、全ドメインで使い回す

#### UseCase 層
- Domain 層のエラーはキャッチせず、そのまま上位に伝播させる
- UseCase 固有のエラーが必要な場合も `DomainError` のサブクラスとして定義する

#### Infrastructure 層
- ドメインエラーを throw しない。「該当データなし」等のビジネス判断は UseCase 層の責務である
- データの不在は戻り値（`null`, 空配列など）で表現し、UseCase 層に判断を委ねる
- 技術的な障害（DB 接続エラー、ネットワークタイムアウト等）はそのまま上位に伝播させる

#### API 層
- `trpc.ts` の middleware が `DomainError` のサブクラスを検出し、適切なコードの `TRPCError` に変換する
- ルーター内でエラーをキャッチしない。エラー変換は middleware に一任する

### ディレクトリ構成

```
server/
├── api/
│   ├── trpc.ts              # tRPC 初期化・ドメインエラー変換 middleware
│   ├── index.ts             # appRouter の定義
│   └── routers/             # 各ドメインのルーター
├── usecase/
│   └── {domain}/            # ドメインごとにディレクトリを分ける
├── domain/
│   ├── id.ts                # ID 生成（nanoid）
│   ├── error/               # ドメインエラー
│   └── {domain}/            # エンティティ + Repository インターフェース
└── infrastructure/
    ├── di/                  # DI コンテナ
    └── {impl}/              # Repository 実装
```
