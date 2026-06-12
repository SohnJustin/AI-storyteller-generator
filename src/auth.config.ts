import type { NextAuthConfig } from "next-auth";

// Edge-safe base config shared by middleware and the full auth instance.
// It must NOT import bcrypt or Prisma so it can run in the Edge runtime.
// Paths that require an authenticated user.
const protectedPaths = ["/profile", "/generate-story"];

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // Gate protected pages via middleware.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p)
      );
      if (isProtected) return isLoggedIn;
      return true;
    },
    // Persist the user id onto the JWT and expose it on the session.
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  // Real providers are added in auth.ts (they need bcrypt + Prisma).
  providers: [],
} satisfies NextAuthConfig;
