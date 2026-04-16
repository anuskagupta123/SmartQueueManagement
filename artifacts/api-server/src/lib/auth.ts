import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "smartqueue-secret-key";

export function signToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token: string): Record<string, unknown> | null {
  try {
    const [header, body, sig] = token.split(".");
    if (!header || !body || !sig) return null;
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");
    if (expected !== sig) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return null;
  }
}

export interface AuthUser {
  id: number;
  email: string;
  role: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "Missing or invalid token" });
    return;
  }
  const token = authHeader.slice(7);
  const payload = verifyToken(token);
  if (!payload || typeof payload.id !== "number") {
    res.status(401).json({ error: "unauthorized", message: "Invalid token" });
    return;
  }
  req.user = payload as unknown as AuthUser;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "forbidden", message: "Insufficient permissions" });
      return;
    }
    next();
  };
}
