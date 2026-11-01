export const AUTH_COOKIE = "ppms_token";

export const APP_ROLES = ["SUPER_ADMIN", "ADMIN", "DOCTOR", "PATIENT", "STAFF"] as const;
export type AppRole = (typeof APP_ROLES)[number];
