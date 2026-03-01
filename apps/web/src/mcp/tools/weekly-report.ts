import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import {
  createWeeklyReportUseCase,
  getWeeklyReportUseCase,
  getWeeklyReportsUseCase,
  reviewWeeklyReportUseCase,
  updateWeeklyReportUseCase,
} from "@/server/infrastructure/di/container";

import { toErrorResult, toSuccess } from "../helpers";

const optionalString = z.optional(z.string());

export const registerWeeklyReportTools = (server: McpServer): void => {
  server.registerTool(
    "list_weekly_reports",
    { description: "週報の一覧を取得する" },
    async () => {
      try {
        const reports = await getWeeklyReportsUseCase.execute();
        return toSuccess(JSON.stringify(reports, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "get_weekly_report",
    {
      description:
        "指定された ID の週報を取得する。その週に紐づく日報の一覧も含む",
      inputSchema: { id: z.string().describe("週報の ID") },
    },
    async ({ id }) => {
      try {
        const report = await getWeeklyReportUseCase.execute({ id });
        return toSuccess(JSON.stringify(report, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "create_weekly_report",
    {
      description:
        "新しい週報を作成する。startDate は月曜日でなければならない。同じ startDate の週報は作成できない",
      inputSchema: {
        startDate: z
          .iso
          .date()
          .describe("週の開始日（月曜日。例: 2026-02-16）"),
        goal: optionalString,
      },
    },
    async (args) => {
      try {
        const report = await createWeeklyReportUseCase.execute({
          startDate: new Date(args.startDate),
          goal: args.goal,
        });
        return toSuccess(JSON.stringify(report, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "update_weekly_report",
    {
      description:
        "既存の週報を更新する。goal の修正を含む汎用的な更新に使う。週の終わりの振り返りには review_weekly_report を使う",
      inputSchema: {
        id: z.string().describe("週報の ID"),
        goal: optionalString,
        summary: optionalString,
        review: optionalString,
        notes: optionalString,
      },
    },
    async (args) => {
      try {
        const report = await updateWeeklyReportUseCase.execute({
          id: args.id,
          goal: args.goal,
          summary: args.summary,
          review: args.review,
          notes: args.notes,
        });
        return toSuccess(JSON.stringify(report, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "review_weekly_report",
    {
      description:
        "週の終わりの振り返り用。summary / review / notes を記録する。goal は変更しない",
      inputSchema: {
        id: z.string().describe("週報の ID"),
        summary: optionalString,
        review: optionalString,
        notes: optionalString,
      },
    },
    async (args) => {
      try {
        const report = await reviewWeeklyReportUseCase.execute({
          id: args.id,
          summary: args.summary,
          review: args.review,
          notes: args.notes,
        });
        return toSuccess(JSON.stringify(report, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );
};
