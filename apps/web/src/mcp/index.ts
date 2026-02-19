import { serve } from "@hono/node-server";

import { MCP_PORT } from "@/config";

import { app } from "./app";

serve({ fetch: app.fetch, port: MCP_PORT }, () => console.log(`MCP server is running on http://localhost:${MCP_PORT}/mcp`));
