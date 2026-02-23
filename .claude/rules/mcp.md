---
description: MCP サーバーの実装指針
globs: apps/*/src/mcp/**/*.ts
---

## MCP サーバーの実装指針

### ファイル構成

```
src/mcp/
├── server.ts          # McpServer の生成、instructions、各 register 関数の呼び出し
├── helpers.ts         # toSuccess / toErrorResult
├── resources/         # Resource の登録（ドメインごとに1ファイル）
└── tools/             # Tool の登録（ドメインごとに1ファイル）
```

### ツールの実装パターン

- ドメインごとに `registerXxxTools(server)` 関数を作り、`server.ts` から呼び出す
- ハンドラは try-catch で囲み、成功時は `toSuccess()`、失敗時は `toErrorResult()` を返す
- 日時は MCP 層で `new Date()` に変換してから UseCase に渡す

### instructions（サーバー全体の説明）

- 簡潔で行動可能な内容にする。マニュアルにしない
- ツール横断でしか伝えられない情報だけを書く（エンティティの関係、操作フロー）
- 個別ツールの制約や仕様は instructions ではなく tool description に書く

### tool description（各ツールの説明）

- ツール名やパラメータ名から自明なことは書かない
- 「迷う・間違える」ポイントだけ補足する（制約、紛らわしい選択肢の区別など）
- AI エージェントには反応的な表現（「エラーになる」）より予防的な表現（「できない」）を使う。不要な API 呼び出しを防げる

### Resources（静的な参照情報）

- ツール呼び出し無しでエージェントが参照できる情報を公開する
- ドメインごとに `registerXxxResource(server)` 関数を作り、`server.ts` から呼び出す
