import "./styles.css";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Buzzer } from "./Buzzer";
import { WebSocketProvider } from "./WebSocketContext";
import { ClientGameStateProvider } from "./ClientGameState";
import { App } from "./App";
import { Presentation } from "./Presentation";
import { Admin } from "./Admin";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/app/buzzer",
    element: <Buzzer />,
  },
  {
    path: "/app",
    element: <App></App>,
  },
  {
    path: "/app/presentation",
    element: <Presentation />,
  },
  {
    path: "/app/admin",
    element: <Admin />,
  },
  {
    path: "/",
    // Redirect to /app
    element: <Navigate to="/app" />,
  },
]);

document.addEventListener("DOMContentLoaded", () => {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider url="/ws">
        <ClientGameStateProvider>
          <RouterProvider router={router} />
        </ClientGameStateProvider>
      </WebSocketProvider>
    </QueryClientProvider>,
  );
});
