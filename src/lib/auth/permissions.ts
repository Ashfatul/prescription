import { RoleName } from "@prisma/client";

/**
 * ============================================================================
 * ROLE & PERMISSION REGISTRY FOR PPMS
 * ============================================================================
 *
 * DEVELOPER INSTRUCTIONS FOR ADDING FUTURE FEATURE PERMISSIONS:
 * ----------------------------------------------------------------------------
 * 1. When adding any new feature, module, or capability to this system:
 *    a) Add the permission key to `PermissionKey` union type below.
 *    b) Add an entry to the `AVAILABLE_PERMISSIONS` array with:
 *       - id: unique string key (e.g. "telehealth:start_call")
 *       - label: clear readable title (e.g. "Start Telehealth Call")
 *       - category: group category (e.g. "Telehealth", "Billing", "Reports")
 *       - description: what this permission grants
 *    c) Specify default role inclusion in `DEFAULT_ROLE_PERMISSIONS`.
 *
 * 2. AUTOMATIC DISCOVERY:
 *    - The Admin Role Permission Management panel dynamically reads `AVAILABLE_PERMISSIONS`.
 *    - Any new permission added here AUTOMATICALLY appears as an interactive checkbox
 *      in the Admin UI with its category, description, and controls without any extra frontend code!
 *
 * 3. ENFORCING PERMISSIONS:
 *    - In API routes:
 *      ```ts
 *      import { requirePermission } from "@/lib/auth/permissions";
 *      await requirePermission(req, "medicines:create");
 *      ```
 *    - In UI components:
 *      ```ts
 *      import { hasPermission } from "@/lib/auth/permissions";
 *      if (hasPermission(rolePermissions, "medicines:create")) { ... }
 *      ```
 * ============================================================================
 */

export const PERMISSION_CATEGORIES = [
  "Users & Accounts",
  "Formulary Catalog",
  "Diagnostic Tests",
  "Prescription Templates",
  "Clinical Prescriptions",
  "Appointments & Queues",
  "System & Analytics",
] as const;

export type PermissionCategory = (typeof PERMISSION_CATEGORIES)[number];

export interface PermissionDefinition {
  id: string;
  label: string;
  category: PermissionCategory;
  description: string;
}

export const AVAILABLE_PERMISSIONS: PermissionDefinition[] = [
  // Users & Accounts
  {
    id: "users:view",
    label: "View User Accounts",
    category: "Users & Accounts",
    description: "Allows viewing the directory of physicians, patients, and staff accounts.",
  },
  {
    id: "users:create",
    label: "Create User Accounts",
    category: "Users & Accounts",
    description: "Allows creating new verified physician, staff, or patient accounts.",
  },
  {
    id: "users:edit",
    label: "Edit User Accounts",
    category: "Users & Accounts",
    description: "Allows modifying user details, contact numbers, roles, and credentials.",
  },
  {
    id: "users:delete",
    label: "Delete User Accounts",
    category: "Users & Accounts",
    description: "Allows removing user accounts from the medical management system.",
  },

  // Formulary Catalog
  {
    id: "medicines:view",
    label: "View Pharmaceutical Catalog",
    category: "Formulary Catalog",
    description: "Allows searching and viewing pharmaceutical catalog items and dosages.",
  },
  {
    id: "medicines:create",
    label: "Add Medicine to Catalog",
    category: "Formulary Catalog",
    description: "Allows registering new pharmaceutical drugs, dosage forms, and defaults.",
  },
  {
    id: "medicines:edit",
    label: "Edit Medicine in Catalog",
    category: "Formulary Catalog",
    description: "Allows updating pharmaceutical names, dosage strengths, and instructions.",
  },
  {
    id: "medicines:delete",
    label: "Delete Medicine from Catalog",
    category: "Formulary Catalog",
    description: "Allows removing discontinued drugs from the hospital formulary.",
  },

  // Diagnostic Tests
  {
    id: "tests:view",
    label: "View Diagnostic Tests",
    category: "Diagnostic Tests",
    description: "Allows viewing available pathological and radiological diagnostic investigations.",
  },
  {
    id: "tests:create",
    label: "Create Diagnostic Test",
    category: "Diagnostic Tests",
    description: "Allows adding new laboratory panels and imaging tests to the formulary.",
  },
  {
    id: "tests:edit",
    label: "Edit Diagnostic Test",
    category: "Diagnostic Tests",
    description: "Allows modifying lab test names and clinical fasting/prep instructions.",
  },
  {
    id: "tests:delete",
    label: "Delete Diagnostic Test",
    category: "Diagnostic Tests",
    description: "Allows removing obsolete lab tests from the hospital master catalog.",
  },

  // Prescription Templates
  {
    id: "templates:view",
    label: "View Prescription Templates",
    category: "Prescription Templates",
    description: "Allows browsing master hospital prescription headers and pad layouts.",
  },
  {
    id: "templates:create",
    label: "Design New Master Template",
    category: "Prescription Templates",
    description: "Allows designing new prescription pad layouts with custom watermarks, logos, and positioning.",
  },
  {
    id: "templates:edit",
    label: "Customize Existing Templates",
    category: "Prescription Templates",
    description: "Allows editing colors, font sizes, watermark opacity, and coordinate offsets of templates.",
  },
  {
    id: "templates:delete",
    label: "Delete Prescription Template",
    category: "Prescription Templates",
    description: "Allows deleting deprecated prescription pad layouts.",
  },

  // Clinical Prescriptions
  {
    id: "prescriptions:create",
    label: "Generate Prescriptions",
    category: "Clinical Prescriptions",
    description: "Allows physicians to draft, sign, and issue clinical prescriptions to patients.",
  },
  {
    id: "prescriptions:view_all",
    label: "View All Prescriptions",
    category: "Clinical Prescriptions",
    description: "Allows clinical staff and administrators to audit all issued prescriptions.",
  },
  {
    id: "prescriptions:view_own",
    label: "View Personal Prescriptions",
    category: "Clinical Prescriptions",
    description: "Allows patients and consulting physicians to review their own prescription records.",
  },
  {
    id: "prescriptions:edit",
    label: "Update Prescriptions",
    category: "Clinical Prescriptions",
    description: "Allows revising medication lists, diagnostic orders, and advice in prescriptions.",
  },
  {
    id: "prescriptions:print",
    label: "Print & Export Prescriptions",
    category: "Clinical Prescriptions",
    description: "Allows generating paginated A4 printouts and downloadable clinical PDFs.",
  },

  // Appointments & Queues
  {
    id: "appointments:view_all",
    label: "View Entire Hospital Queue",
    category: "Appointments & Queues",
    description: "Allows desk staff to monitor all physician consultation queues and daily rosters.",
  },
  {
    id: "appointments:view_own",
    label: "View Personal Appointments",
    category: "Appointments & Queues",
    description: "Allows patients and doctors to view their scheduled consultation serials.",
  },
  {
    id: "appointments:book",
    label: "Book Appointments",
    category: "Appointments & Queues",
    description: "Allows scheduling new patient appointments and assigning serial numbers.",
  },
  {
    id: "appointments:manage_queue",
    label: "Manage Chamber Queue Serials",
    category: "Appointments & Queues",
    description: "Allows front desk staff and doctors to advance queues and mark consultations complete.",
  },
  {
    id: "appointments:cancel",
    label: "Cancel Appointments",
    category: "Appointments & Queues",
    description: "Allows cancelling bookings and voiding queue tokens.",
  },

  // System & Analytics
  {
    id: "analytics:view",
    label: "View System Analytics",
    category: "System & Analytics",
    description: "Allows viewing high-level hospital KPIs, patient volume, and prescription counts.",
  },
  {
    id: "roles:manage",
    label: "Manage Roles & Permissions",
    category: "System & Analytics",
    description: "Allows modifying granular access control rules and feature permissions across roles.",
  },
  {
    id: "settings:manage",
    label: "Manage System Settings",
    category: "System & Analytics",
    description: "Allows modifying global hospital configuration, branding, and defaults.",
  },
];

export type PermissionKey = (typeof AVAILABLE_PERMISSIONS)[number]["id"];

/**
 * Standard recommended default permissions for each role.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleName, string[]> = {
  SUPER_ADMIN: AVAILABLE_PERMISSIONS.map((p) => p.id),

  DOCTOR: [
    "medicines:view",
    "medicines:create",
    "tests:view",
    "tests:create",
    "templates:view",
    "prescriptions:create",
    "prescriptions:view_own",
    "prescriptions:edit",
    "prescriptions:print",
    "appointments:view_own",
    "appointments:manage_queue",
  ],

  STAFF: [
    "users:view",
    "medicines:view",
    "medicines:create",
    "medicines:edit",
    "tests:view",
    "tests:create",
    "tests:edit",
    "templates:view",
    "templates:create",
    "templates:edit",
    "prescriptions:view_all",
    "prescriptions:print",
    "appointments:view_all",
    "appointments:book",
    "appointments:manage_queue",
    "appointments:cancel",
    "analytics:view",
  ],

  PATIENT: [
    "prescriptions:view_own",
    "prescriptions:print",
    "appointments:view_own",
    "appointments:book",
  ],
};

/**
 * Check if a permission list includes the requested permission.
 * Super Admin always has full access.
 */
export function hasPermission(
  permissions: string[] | undefined | null,
  requiredPermission: string,
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true;
  if (!permissions || !Array.isArray(permissions)) return false;
  return permissions.includes(requiredPermission) || permissions.includes("*");
}
