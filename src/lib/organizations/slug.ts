export const RESERVED_SLUGS = [
  "api",
  "auth",
  "login",
  "register",
  "dashboard",
  "admin",
  "superadmin",
  "www",
  "app",
  "staff",
  "doctors",
  "clinics",
  "prescriptions",
  "live-queue",
  "terms",
  "privacy",
  "disclaimer",
  "pricing",
  "support",
  "static",
  "public",
  "mail",
  "test",
  "demo",
  "help",
  "assets",
  "billing",
  "status",
  "webhook",
  "stripe",
  "root",
] as const;

export function cleanSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidSlugFormat(slug: string): { valid: boolean; reason?: string } {
  const cleaned = cleanSlug(slug);

  if (!cleaned || cleaned.length < 3) {
    return { valid: false, reason: "Subdomain must be at least 3 characters long." };
  }

  if (cleaned.length > 48) {
    return { valid: false, reason: "Subdomain cannot exceed 48 characters." };
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleaned)) {
    return {
      valid: false,
      reason: "Subdomain can only contain lowercase letters, numbers, and single hyphens.",
    };
  }

  if ((RESERVED_SLUGS as readonly string[]).includes(cleaned)) {
    return {
      valid: false,
      reason: `'${cleaned}' is a reserved system subdomain. Please choose another name.`,
    };
  }

  return { valid: true };
}
