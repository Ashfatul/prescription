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
