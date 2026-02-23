import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const SCHEMA = `\
## DailyReport

list_daily_reports / get_daily_report が返す構造:
- id: string
- date: string (ISO 8601)
- goal: string | null
- summary: string | null
- wakeUpTime: string | null (ISO 8601)
- bedTime: string | null (ISO 8601)
- review: string | null
- notes: string | null
- createdAt: string (ISO 8601)

## Project

list_projects / get_project が返す構造:
- id: string
- name: string
- purpose: string
- status: "active" | "done"
- deadline: string | null (ISO 8601)
- createdAt: string (ISO 8601)

## Task

list_tasks が返す構造（概要）:
- id: string
- title: string
- status: "not_started" | "in_progress" | "done" | "cancelled" | "deferred"
- dailyReportDate: string | null (ISO 8601)

get_task が返す構造（詳細）:
- id: string
- title: string
- description: string | null
- status: "not_started" | "in_progress" | "done" | "cancelled" | "deferred"
- deadline: string | null (ISO 8601)
- estimatedMinutes: number | null
- incompletionReason: string | null
- dailyReportDate: string | null (ISO 8601)
- project: { id: string, name: string } | null
- createdAt: string (ISO 8601)
`;

const URI = "secretary://schema";

export const registerSchemaResource = (server: McpServer): void => {
  server.registerResource(
    "schema",
    URI,
    {
      description: "各ツールが返すデータの構造",
      mimeType: "text/plain",
    },
    () => ({
      contents: [{ uri: URI, text: SCHEMA }],
    }),
  );
};
