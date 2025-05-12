import "./styles.css";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Buzzer } from "./Buzzer";
import { WebSocketProvider } from "./WebSocketContext";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
  {
    path: "/buzzer",
    element: <Buzzer />,
  },
]);

document.addEventListener("DOMContentLoaded", () => {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider url="/ws">
        <RouterProvider router={router} />
      </WebSocketProvider>
    </QueryClientProvider>,
  );
});
