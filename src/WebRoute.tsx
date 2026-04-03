import { createBrowserRouter, Navigate, Outlet, RouterProvider } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Income from "@/pages/Income";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import AppShell from "@/layout/AppShell";

/**
 * ProtectedRoute
 *
 * Wraps child routes and redirects to /login if the user is not authenticated.
 *
 * @returns {JSX.Element} The child outlet if authenticated, or a redirect to /login.
 */
const ProtectedRoute = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

/**
 * PublicRoute
 *
 * Wraps public routes and redirects to / if the user is already authenticated.
 *
 * @returns {JSX.Element} The child outlet if not authenticated, or a redirect to /.
 */
const PublicRoute = () => {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/**
 * buildRouter
 *
 * Creates the React Router 7 browser router with all app routes.
 * Protected routes are wrapped with ProtectedRoute, public routes with PublicRoute.
 * Layout is handled by AppShell, which now provides the shared sidebar and header.
 *
 * @returns {import("react-router-dom").Router} The configured browser router.
 */
const buildRouter = () => {
  return createBrowserRouter([
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppShell />,
          children: [
            { path: "/", element: <Dashboard /> },
            { path: "/expenses", element: <Expenses /> },
            { path: "/income", element: <Income /> },
            { path: "/analytics", element: <Analytics /> },
            { path: "/settings", element: <Settings /> },
          ],
        },
      ],
    },
    {
      element: <PublicRoute />,
      children: [
        { path: "/login", element: <Login /> },
      ],
    },
  ]);
};

/**
 * WebRoute
 *
 * Renders the configured router via RouterProvider.
 * This should be used once at the top level of the app.
 *
 * @returns {JSX.Element} The routing provider for the application.
 */
const WebRoute = () => {
  const router = buildRouter();

  return <RouterProvider router={router} />;
};

export default WebRoute;
