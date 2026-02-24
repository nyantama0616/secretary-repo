import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";

import {
  createProjectUseCase,
  getProjectUseCase,
  getProjectsUseCase,
  updateProjectStatusUseCase,
  updateProjectUseCase,
} from "@/server/infrastructure/di/container";

import { toErrorResult, toSuccess } from "../helpers";

const projectStatusEnum = z.enum(["active", "done"]);
const optionalString = z.optional(z.string());
const optionalDatetime = z.optional(
  z.iso.datetime().describe("ISO 8601 形式（例: 2026-06-30T00:00:00.000Z）"),
);

export const registerProjectTools = (server: McpServer): void => {
  server.registerTool(
    "list_projects",
    {
      description: "プロジェクトの一覧を取得する",
    },
    async () => {
      try {
        const projects = await getProjectsUseCase.execute();
        return toSuccess(JSON.stringify(projects, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "get_project",
    {
      description: "指定された ID のプロジェクト詳細を取得する",
      inputSchema: { id: z.string().describe("プロジェクトの ID") },
    },
    async ({ id }) => {
      try {
        const project = await getProjectUseCase.execute({ id });
        return toSuccess(JSON.stringify(project, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "create_project",
    {
      description: "新しいプロジェクトを作成する",
      inputSchema: {
        name: z.string().describe("プロジェクト名"),
        purpose: z.string().describe("プロジェクトの目的"),
        notes: optionalString,
        deadline: optionalDatetime.describe("期限"),
      },
    },
    async (args) => {
      try {
        const project = await createProjectUseCase.execute({
          name: args.name,
          purpose: args.purpose,
          notes: args.notes,
          deadline: args.deadline ? new Date(args.deadline) : undefined,
        });
        return toSuccess(JSON.stringify(project, null, 2));
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "update_project",
    {
      description: "既存のプロジェクトを更新する",
      inputSchema: {
        id: z.string().describe("プロジェクトの ID"),
        name: optionalString.describe("プロジェクト名"),
        purpose: optionalString.describe("プロジェクトの目的"),
        notes: z.optional(z.nullable(z.string())),
        deadline: z
          .optional(z.nullable(z.iso.datetime()))
          .describe(
            "期限（ISO 8601 形式、null で期限を解除）",
          ),
      },
    },
    async (args) => {
      try {
        await updateProjectUseCase.execute({
          id: args.id,
          name: args.name,
          purpose: args.purpose,
          notes: args.notes,
          deadline:
            args.deadline === null
              ? null
              : args.deadline
                ? new Date(args.deadline)
                : undefined,
        });
        return toSuccess("プロジェクトを更新しました");
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );

  server.registerTool(
    "update_project_status",
    {
      description: "プロジェクトのステータスを変更する",
      inputSchema: {
        id: z.string().describe("プロジェクトの ID"),
        status: projectStatusEnum.describe("変更後のステータス"),
      },
    },
    async (args) => {
      try {
        await updateProjectStatusUseCase.execute({
          id: args.id,
          status: args.status,
        });
        return toSuccess("ステータスを更新しました");
      } catch (error) {
        return toErrorResult(error);
      }
    },
  );
};
