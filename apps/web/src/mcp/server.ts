import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { toSuccess } from "./helpers";
import { registerDailyReportTools } from "./tools/daily-report";
import { registerTaskTools } from "./tools/task";

export const createMcpServer = (): McpServer => {
  const server = new McpServer({
    name: "secretary",
    version: "0.1.0",
  });

  server.registerTool("ping", { description: "サーバーの疎通確認を行う" }, () =>
    toSuccess("pong"),
  );

  registerDailyReportTools(server);
  registerTaskTools(server);

  return server;
};
