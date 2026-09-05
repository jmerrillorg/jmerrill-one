import type { NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

function allowedAdmins() {
  return new Set(
    (process.env.JM1_MARKETING_COMMAND_CENTER_ADMINS || "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
}

export const marketingAuthOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.JM1_COMMAND_CENTER_CLIENT_ID || "",
      clientSecret: process.env.JM1_COMMAND_CENTER_CLIENT_SECRET || "",
      tenantId: process.env.JM1_COMMAND_CENTER_TENANT_ID || "",
    }),
  ],
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase() || "";
      return email.length > 0 && allowedAdmins().has(email);
    },
    async session({ session, token }) {
      if (session.user && token.email) session.user.email = String(token.email);
      return session;
    },
  },
  pages: { error: "/marketing/access-denied" },
};
