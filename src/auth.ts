import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prismaClient";
import { authConfig } from "@/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) return null;

        // Only return non-sensitive fields — never the password hash.
        const name =
          [user.fName, user.lName].filter(Boolean).join(" ") || null;
        return { id: String(user.id), email: user.email, name };
      },
    }),
  ],
});
