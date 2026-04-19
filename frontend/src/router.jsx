import { RouterProvider, createRouter, createRootRoute, createRoute } from "@tanstack/react-router";
import App from "./App.jsx";

// Create a root route
const rootRoute = createRootRoute({
  component: App,
});

// Create routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <div>Welcome to QualiTrack</div>,
});

// Create the router
const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute]),
});

export function Router() {
  return <RouterProvider router={router} />;
}
