import indexHtml from "../public/index.html";
import { serve } from "bun";

const server = serve({
  websocket: {
    async message(ws, message) {
      console.log(`Received ${message}`);
      // send back a message
      ws.send(`You said: ${message}`);
    },
  },
  routes: {
    "/": indexHtml,
    "/hello": async () => {},
  },
  port: 3000,
});

console.log("Server started on port 3000");
