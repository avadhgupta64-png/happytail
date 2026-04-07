import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { RequestHandler } from "express";

interface ConnectedUser {
  ws: WebSocket;
  userId: string;
}

const connectedUsers = new Map<WebSocket, ConnectedUser>();

function getOnlineCount(): number {
  const uniqueUsers = new Set<string>();
  connectedUsers.forEach((u) => uniqueUsers.add(u.userId));
  return uniqueUsers.size;
}

function broadcast(data: object) {
  const msg = JSON.stringify(data);
  connectedUsers.forEach((u) => {
    if (u.ws.readyState === WebSocket.OPEN) {
      u.ws.send(msg);
    }
  });
}

export function setupWebSocket(httpServer: Server, sessionMiddleware: RequestHandler) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws, req) => {
    const res = { writeHead: () => {}, end: () => {} } as any;
    sessionMiddleware(req as any, res, () => {
      const passport = (req as any).session?.passport;
      const user = passport?.user;
      if (!user?.claims?.sub) {
        ws.close(4001, "Unauthorized");
        return;
      }

      const userId = user.claims.sub;
      connectedUsers.set(ws, { ws, userId });
      broadcast({ type: "online_count", count: getOnlineCount() });

      ws.on("close", () => {
        connectedUsers.delete(ws);
        broadcast({ type: "online_count", count: getOnlineCount() });
      });
    });
  });

  return wss;
}
