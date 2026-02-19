import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import {
  getDailyReportUseCase,
  getDailyReportsUseCase,
} from "@/server/infrastructure/di/container";

import { toErrorResult, toSuccess } from "../helpers";

export const registerDailyReportTools = (server: McpServer): void => {
  server.registerTool(
    "list_daily_reports",
    { description: "日報の一覧を取得する" },
    async () => {
      try {
        const reports = await getDailyReportsUseCase.execute();
        return toSuccess(JSON.stringify(reports, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "get_daily_report",
    {
      description: "指定された ID の日報を取得する",
      inputSchema: { id: z.string().describe("日報の ID") },
    },
    async ({ id }) => {
      try {
        const report = await getDailyReportUseCase.execute({ id });
        return toSuccess(JSON.stringify(report, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );
};
