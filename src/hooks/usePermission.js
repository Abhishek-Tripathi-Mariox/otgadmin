import { useSelector } from "react-redux";

/**
 * Hook for checking RBAC permissions on the frontend.
 *
 * Usage:
 *   const { can, isSuperAdmin } = usePermission();
 *   if (can("bookings", "edit")) { ... }
 */
export default function usePermission() {
  const admin = useSelector((s) => s.auth.admin);

  const isSuperAdmin =
    !!admin &&
    (admin.isSuperAdmin === true ||
      admin.role === "super-admin" ||
      (Array.isArray(admin.permissions) && admin.permissions.includes("all")));

  const can = (moduleKey, action = "view") => {
    if (!admin) return false;
    if (isSuperAdmin) return true;

    const perms = admin.permissions;
    if (Array.isArray(perms)) {
      return perms.includes("all") || perms.includes(`${moduleKey}:${action}`);
    }
    return !!perms?.[moduleKey]?.[action];
  };

  const canAny = (moduleKey, actions = ["view"]) =>
    actions.some((a) => can(moduleKey, a));

  return { can, canAny, isSuperAdmin, admin };
}
