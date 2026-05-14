import { Navigate, Outlet } from "react-router-dom";
import usePermission from "../hooks/usePermission";

/**
 * Gates a route by RBAC permission. Renders children only if user has
 * `can(module, action)`; otherwise redirects to /dashboard.
 *
 * Used as: <Route element={<PermissionRoute module="staff" />}>...</Route>
 */
export default function PermissionRoute({ module, action = "view", children }) {
  const { can, isSuperAdmin } = usePermission();

  if (!isSuperAdmin && !can(module, action)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}
