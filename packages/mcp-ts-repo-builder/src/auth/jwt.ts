import type { User } from "../models/user";

const SECRET = "fixture-secret-not-for-production";

export function signToken(user: User): string {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, role: user.role })).toString("base64url");
  const signature = Buffer.from(`${payload}.${SECRET}`).toString("base64url").slice(0, 16);
  return `${payload}.${signature}`;
}

export function verifyToken(token: string): User | null {
  const [payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      sub: string;
      role: User["role"];
    };
    return {
      id: decoded.sub,
      email: `${decoded.sub}@example.com`,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}
