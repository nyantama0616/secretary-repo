import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { toSuccess } from "./helpers";
import { registerSchemaResource } from "./resources/schema";
import { registerDailyReportTools } from "./tools/daily-report";
import { registerProjectTools } from "./tools/project";
import { registerTaskTools } from "./tools/task";
import { registerWeeklyReportTools } from "./tools/weekly-report";

const INSTRUCTIONS = `\
日報・タスク管理アプリのバックエンド。ユーザーの1日の計画・実行・振り返りを支援する。

## エンティティの関係

タスクは日報やプロジェクトに紐づけられるが、紐づけなくても存在できる。日報とプロジェクトの間に直接の関係はない。
週報は月曜始まりの7日間を表し、その期間の日報が自動的に紐づく。週報と日報は期間で関連するだけで、明示的な紐づけ操作は不要である。

## 典型的な操作フロー

朝: 日報を作成（goal を設定）→ タスクを作成して日報に紐づけ → 並び順を決める
日中: タスクのステータスを進める
夜: 日報に summary と review を記録する
週の最初: 週報を create_weekly_report で作成し、goal を設定する
週の終わり: review_weekly_report で振り返り（summary / review / notes）を記録する
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
  registerWeeklyReportTools(server);

  return server;
};
