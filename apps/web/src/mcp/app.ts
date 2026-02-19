import { randomUUID } from "node:crypto";

import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { createMcpServer } from "./server";

const SESSION_TTL_MS = 30 * 60 * 1000;

type Session = {
  transport: WebStandardStreamableHTTPServerTransport;
  timer: ReturnType<typeof setTimeout>;
};

const sessions = new Map<string, Session>();

const deleteSession = (sessionId: string) => {
  const session = sessions.get(sessionId);
  if (!session) return;
  clearTimeout(session.timer);
  sessions.delete(sessionId);
};

const touchSession = (sessionId: string) => {
  const session = sessions.get(sessionId);
  if (!session) return;
  clearTimeout(session.timer);
  session.timer = setTimeout(() => {
    session.transport.close();
    deleteSession(sessionId);
  }, SESSION_TTL_MS);
};

const getTransport = (sessionId: string) => {
  const session = sessions.get(sessionId);
  if (!session) return undefined;
  touchSession(sessionId);
  return session.transport;
};

export const app = new Hono();

app.use(
  "/mcp",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: [
      "Content-Type",
      "mcp-session-id",
      "Last-Event-ID",
      "mcp-protocol-version",
    ],
    exposeHeaders: ["mcp-session-id", "mcp-protocol-version"],
  }),
);

app.post("/mcp", async (c) => {
  const sessionId = c.req.header("mcp-session-id");

  if (sessionId) {
    const transport = getTransport(sessionId);
    if (!transport) {
      return c.text("Session not found", 404);
    }
    return transport.handleRequest(c.req.raw);
  }

  // NOTE: セッションIDがない場合は initialize リクエストとして新しいセッションを作成する
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    onsessioninitialized: (id) => {
      const timer = setTimeout(() => {
        transport.close();
        deleteSession(id);
      }, SESSION_TTL_MS);
      sessions.set(id, { transport, timer });
    },
  });

  transport.onclose = () => {
    if (transport.sessionId) {
      deleteSession(transport.sessionId);
    }
  };

  const server = createMcpServer();
  await server.connect(transport);
  return transport.handleRequest(c.req.raw);
});

app.get("/mcp", async (c) => {
  const sessionId = c.req.header("mcp-session-id");
  if (!sessionId) {
    return c.text("mcp-session-id header is required", 400);
  }

  const transport = getTransport(sessionId);
  if (!transport) {
    return c.text("Session not found", 404);
  }

  return transport.handleRequest(c.req.raw);
});

app.delete("/mcp", async (c) => {
  const sessionId = c.req.header("mcp-session-id");
  if (!sessionId) {
    return c.text("mcp-session-id header is required", 400);
  }

  const transport = getTransport(sessionId);
  if (!transport) {
    return c.text("Session not found", 404);
  }

  return transport.handleRequest(c.req.raw);
});
