import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
export const authConfigured = () => !!process.env.AUTH_GITHUB_ID && !!process.env.AUTH_GITHUB_SECRET && (process.env.AUTH_SECRET?.length ?? 0) >= 32 && /^\d+$/.test(process.env.OWNER_GITHUB_ID ?? "") && process.env.VERCEL_ENV !== "preview";
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub({ authorization: { params: { scope: "read:user" } } })],
  session: { strategy: "jwt", maxAge: 1800 }, trustHost: true,
  callbacks: {
    signIn: async ({ account, profile }) => authConfigured() && account?.provider === "github" && String(profile?.id) === process.env.OWNER_GITHUB_ID,
    jwt: async ({ token, account, profile }) => { if (account) token.ownerId = account.provider === "github" ? String(profile?.id) : undefined; return token; },
    session: async ({ session, token }) => { session.user.id = String(token.ownerId ?? ""); return session; },
  },
  logger: { error: () => console.warn("owner_authentication_error"), warn: () => {}, debug: () => {} },
});
export async function ownerSession() { if (!authConfigured()) return null; const session = await auth(); return session?.user?.id === process.env.OWNER_GITHUB_ID ? session : null; }
