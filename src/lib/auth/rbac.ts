import { AppError } from "@/lib/errors";
import { AppRole } from "@/lib/auth/constants";

export function assertRole(currentRole: AppRole, allowed: AppRole[]) {
  if (!allowed.includes(currentRole)) {
    throw new AppError("Forbidden", 403);
  }
}

export function canAccessDashboardPath(pathname: string, role: AppRole) {
  if (pathname.startsWith("/dashboard/admin")) {
    return ["SUPER_ADMIN", "ADMIN", "STAFF"].includes(role);
  }

  if (pathname.startsWith("/dashboard/doctor")) {
    return role === "DOCTOR";
  }

  if (pathname.startsWith("/dashboard/patient")) {
    return role === "PATIENT";
  }

  return true;
}
