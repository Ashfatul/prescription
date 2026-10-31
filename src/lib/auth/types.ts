import { AppRole } from "@/lib/auth/constants";

export type AuthPayload = {
  sub: string;
  role: AppRole;
  exp?: number;
  iat?: number;
};
