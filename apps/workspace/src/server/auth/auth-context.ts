import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

const betterAuthNextJs = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});

export const {
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
  isAuthenticated,
} = betterAuthNextJs;

export async function getServerSession() {
  const token = await getToken();
  if (!token) return null;
  return { convexToken: token };
}

export async function getServerSessionOrThrow() {
  const session = await getServerSession();
  if (!session) throw new Error("Authentication required.");
  return session;
}
