import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import {
  assignDailyReportUseCase,
  createTaskUseCase,
  deleteTaskUseCase,
  getTaskDetailUseCase,
  getTasksUseCase,
  reorderTasksUseCase,
  updateTaskStatusUseCase,
  updateTaskUseCase,
} from "@/server/infrastructure/di/container";

import { toErrorResult, toSuccess } from "../helpers";

const optionalString = z.optional(z.string());
const optionalDatetime = z.optional(
  z.iso.datetime().describe("ISO 8601 形式（例: 2026-02-20T09:00:00.000Z）"),
);
const taskStatusEnum = z.enum([
  "not_started",
  "in_progress",
  "done",
  "cancelled",
  "deferred",
]);

export const registerTaskTools = (server: McpServer): void => {
  server.registerTool(
    "list_tasks",
    {
      description:
        "タスクの一覧を取得する。フィルターを指定して絞り込みが可能",
      inputSchema: {
        dailyReportId: z
          .optional(z.string())
          .describe("日報 ID で絞り込む"),
        statuses: z
          .optional(z.array(taskStatusEnum))
          .describe("ステータスで絞り込む"),
      },
    },
    async (args) => {
      try {
        const tasks = await getTasksUseCase.execute({
          dailyReportId: args.dailyReportId,
          statuses: args.statuses,
        });
        return toSuccess(JSON.stringify(tasks, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "get_task",
    {
      description: "指定された ID のタスク詳細を取得する",
      inputSchema: { id: z.string().describe("タスクの ID") },
    },
    async ({ id }) => {
      try {
        const task = await getTaskDetailUseCase.execute({ id });
        return toSuccess(JSON.stringify(task, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "create_task",
    {
      description: "新しいタスクを作成する",
      inputSchema: {
        title: z.string().describe("タスクのタイトル"),
        description: optionalString.describe("タスクの説明"),
        dailyReportId: optionalString.describe("紐づける日報の ID"),
        projectId: optionalString.describe("紐づけるプロジェクトの ID"),
        deadline: optionalDatetime.describe("期限"),
        estimatedMinutes: z
          .optional(z.number())
          .describe("見積もり時間（分）"),
      },
    },
    async (args) => {
      try {
        const task = await createTaskUseCase.execute({
          title: args.title,
          description: args.description,
          dailyReportId: args.dailyReportId,
          projectId: args.projectId,
          deadline: args.deadline ? new Date(args.deadline) : undefined,
          estimatedMinutes: args.estimatedMinutes,
        });
        return toSuccess(JSON.stringify(task, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "update_task",
    {
      description: "既存のタスクを更新する",
      inputSchema: {
        id: z.string().describe("タスクの ID"),
        title: optionalString.describe("タスクのタイトル"),
        description: optionalString.describe("タスクの説明"),
        projectId: optionalString.describe("プロジェクトの ID"),
        deadline: optionalDatetime.describe("期限"),
        estimatedMinutes: z
          .optional(z.number())
          .describe("見積もり時間（分）"),
        incompletionReason: optionalString.describe(
          "未達成の理由（cancelled / deferred にする場合に記録する）",
        ),
      },
    },
    async (args) => {
      try {
        await updateTaskUseCase.execute({
          id: args.id,
          title: args.title,
          description: args.description,
          projectId: args.projectId,
          deadline: args.deadline ? new Date(args.deadline) : undefined,
          estimatedMinutes: args.estimatedMinutes,
          incompletionReason: args.incompletionReason,
        });
        return toSuccess("タスクを更新しました");
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "update_task_status",
    {
      description:
        "タスクのステータスを変更する。cancelled は「やる必要がなくなった」、deferred は「後日やる」を意味する",
      inputSchema: {
        id: z.string().describe("タスクの ID"),
        status: taskStatusEnum.describe("変更後のステータス"),
        incompletionReason: optionalString.describe(
          "未達成の理由（cancelled / deferred にする場合に記録する）",
        ),
      },
    },
    async (args) => {
      try {
        await updateTaskStatusUseCase.execute({
          id: args.id,
          status: args.status,
          incompletionReason: args.incompletionReason,
        });
        return toSuccess("ステータスを更新しました");
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "delete_task",
    {
      description: "タスクを削除する",
      inputSchema: { id: z.string().describe("タスクの ID") },
    },
    async ({ id }) => {
      try {
        await deleteTaskUseCase.execute({ id });
        return toSuccess("タスクを削除しました");
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "assign_task_to_daily_report",
    {
      description: "タスクを日報に紐づける。dailyReportId に null を渡すと紐づけを解除する",
      inputSchema: {
        id: z.string().describe("タスクの ID"),
        dailyReportId: z
          .nullable(z.string())
          .describe("紐づける日報の ID（null で解除）"),
      },
    },
    async (args) => {
      try {
        await assignDailyReportUseCase.execute({
          id: args.id,
          dailyReportId: args.dailyReportId,
        });
        return toSuccess("日報への紐づけを更新しました");
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "reorder_tasks",
    {
      description:
        "タスクの並び順を変更する。配列の先頭が最も優先度が高い。並べ替え対象のタスク ID を全て含める必要がある",
      inputSchema: {
        taskIds: z
          .array(z.string())
          .describe("並べ替え後のタスク ID の配列"),
      },
    },
    async ({ taskIds }) => {
      try {
        await reorderTasksUseCase.execute({ taskIds });
        return toSuccess("並び順を更新しました");
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );
};
