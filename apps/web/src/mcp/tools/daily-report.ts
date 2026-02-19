import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import {
  createDailyReportUseCase,
  getDailyReportUseCase,
  getDailyReportsUseCase,
  updateDailyReportUseCase,
} from "@/server/infrastructure/di/container";

import { toErrorResult, toSuccess } from "../helpers";

const optionalString = z.optional(z.string());
const optionalDatetime = z.optional(
  z.iso.datetime().describe("ISO 8601 形式（例: 2026-02-20T07:00:00.000Z）"),
);

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

  server.registerTool(
    "create_daily_report",
    {
      description: "新しい日報を作成する",
      inputSchema: {
        date: z.iso.date().describe("日報の日付（例: 2026-02-20）"),
        plan: optionalString,
        summary: optionalString,
        wakeUpTime: optionalDatetime,
        bedTime: optionalDatetime,
        goodPoints: optionalString,
        badPoints: optionalString,
        learnings: optionalString,
        nextActions: optionalString,
        notes: optionalString,
      },
    },
    async (args) => {
      try {
        const report = await createDailyReportUseCase.execute({
          date: new Date(args.date),
          plan: args.plan,
          summary: args.summary,
          wakeUpTime: args.wakeUpTime ? new Date(args.wakeUpTime) : undefined,
          bedTime: args.bedTime ? new Date(args.bedTime) : undefined,
          goodPoints: args.goodPoints,
          badPoints: args.badPoints,
          learnings: args.learnings,
          nextActions: args.nextActions,
          notes: args.notes,
        });
        return toSuccess(JSON.stringify(report, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "update_daily_report",
    {
      description: "既存の日報を更新する",
      inputSchema: {
        id: z.string().describe("日報の ID"),
        plan: optionalString,
        summary: optionalString,
        wakeUpTime: optionalDatetime,
        bedTime: optionalDatetime,
        goodPoints: optionalString,
        badPoints: optionalString,
        learnings: optionalString,
        nextActions: optionalString,
        notes: optionalString,
      },
    },
    async (args) => {
      try {
        const report = await updateDailyReportUseCase.execute({
          id: args.id,
          plan: args.plan,
          summary: args.summary,
          wakeUpTime: args.wakeUpTime ? new Date(args.wakeUpTime) : undefined,
          bedTime: args.bedTime ? new Date(args.bedTime) : undefined,
          goodPoints: args.goodPoints,
          badPoints: args.badPoints,
          learnings: args.learnings,
          nextActions: args.nextActions,
          notes: args.notes,
        });
        return toSuccess(JSON.stringify(report, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );
};
