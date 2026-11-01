import { AppRole } from "@/lib/auth/constants";

export type AuthPayload = {
  sub: string;
  role: AppRole;
  organizationId?: string | null;
  exp?: number;
  iat?: number;
};
