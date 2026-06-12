import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Use the edge-safe config (no bcrypt/Prisma) for middleware-based route gating.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Run on everything except Next internals, the auth API, and static assets.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
