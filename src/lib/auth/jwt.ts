import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";
import { AuthPayload } from "@/lib/auth/types";

const encoder = new TextEncoder();
const secret = encoder.encode(env.jwtSecret);

export async function signToken(payload: AuthPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.jwtExpiresIn)
    .sign(secret);
}

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as AuthPayload;
  } catch {
    return null;
  }
}

export async function sign2FATempToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId, type: "2fa_challenge" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(secret);
}

export async function verify2FATempToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (payload.type !== "2fa_challenge" || !payload.sub) {
      return null;
    }
    return { userId: payload.sub };
  } catch {
    return null;
  }
}
