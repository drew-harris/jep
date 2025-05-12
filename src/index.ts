import indexHtml from "../public/index.html";
import { serve } from "bun";
import type { Message, MessageType } from "./types";
import { handlers } from "./serverHandleMessage";
import { game } from "./state";

const wsClients: Bun.ServerWebSocket<unknown>[] = [];

const server = serve({
  websocket: {
    open(ws) {
      wsClients.push(ws);
      console.info(`Client connected`);

      // send a sync message
      ws.send(
        JSON.stringify({
          type: "sync",
          data: game.getState(),
        }),
      );
    },
    close(ws, code, reason) {
      wsClients.splice(wsClients.indexOf(ws), 1);
      console.log(`Client disconnected: ${code} ${reason}`);
    },
    async message(ws, message) {
      // Handle message
      if (typeof message !== "string") {
        return;
      }
      const parsedJson = JSON.parse(message) as Message<any>;
      console.log("Parsed JSON:", parsedJson);

      const type = parsedJson.type as MessageType;

      // Get handler
      const handler = handlers[type];
      if (!handler) {
        console.warn(`No handler for message type ${type}`);
        return;
      }

      // Build broadcast function
      const broadcast = (
        type: MessageType,
        data: Message<MessageType>["data"],
        inclusive = false,
      ) => {
        const messageString = JSON.stringify({
          type,
          data,
        });
        wsClients.forEach((client) => {
          if (inclusive || client !== ws) {
            client.send(messageString);
          }
        });
      };

      // Send the message to everyone else
      const spread = () => {
        wsClients.forEach((client) => {
          if (client !== ws) {
            client.send(message);
          }
        });
      };

      // Call handler
      handler(parsedJson.data, broadcast, spread, ws);

      // Push state eventually?
      broadcast("sync", game.getState(), true);
    },
  },
  routes: {
    "/": indexHtml,
    "/app": indexHtml,
    "/ws": (req, server) => {
      const success = server.upgrade(req);
      if (success) {
        // Bun automatically returns a 101 Switching Protocols
        // if the upgrade succeeds
        return undefined;
      }

      // handle HTTP request normally
      return new Response("Hello world!");
    },
    "/app/*": indexHtml,
    "/hello": async () => {},
  },
  port: 3000,
});

console.log("Server started on port 3000");
