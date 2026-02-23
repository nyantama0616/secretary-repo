import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { toSuccess } from "./helpers";
import { registerSchemaResource } from "./resources/schema";
import { registerDailyReportTools } from "./tools/daily-report";
import { registerProjectTools } from "./tools/project";
import { registerTaskTools } from "./tools/task";

const INSTRUCTIONS = `\
日報・タスク管理アプリのバックエンド。ユーザーの1日の計画・実行・振り返りを支援する。

## エンティティの関係

タスクは日報やプロジェクトに紐づけられるが、紐づけなくても存在できる。日報とプロジェクトの間に直接の関係はない。

## 典型的な操作フロー

朝: 日報を作成（goal を設定）→ タスクを作成して日報に紐づけ → 並び順を決める
日中: タスクのステータスを進める
夜: 日報に summary と review を記録する
`;

export const createMcpServer = (): McpServer => {
  const server = new McpServer(
    {
      name: "secretary",
      version: "0.1.0",
    },
    { instructions: INSTRUCTIONS },
  );

  server.registerTool("ping", { description: "サーバーの疎通確認を行う" }, () =>
    toSuccess("pong"),
  );

  registerSchemaResource(server);
  registerDailyReportTools(server);
  registerProjectTools(server);
  registerTaskTools(server);

  return server;
};
