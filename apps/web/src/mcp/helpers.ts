import { DomainError } from "@/server/domain/error/domain-errors";

export type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

export const toSuccess = (text: string): ToolResult => ({
  content: [{ type: "text", text }],
});

export const toErrorResult = (error: unknown): ToolResult => {
  const message =
    error instanceof DomainError
      ? error.message
      : "予期しないエラーが発生しました";

  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
};
