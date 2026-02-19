import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export const createMcpServer = (): McpServer => {
  const server = new McpServer({
    name: "secretary",
    version: "0.1.0",
  });

  server.registerTool("ping", { description: "サーバーの疎通確認を行う" }, () => ({
    content: [{ type: "text" as const, text: "pong" }],
  }));

  return server;
};
