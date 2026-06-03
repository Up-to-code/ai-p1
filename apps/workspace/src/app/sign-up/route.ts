import { getSignUpUrl } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

function safeReturnTo(value: string | null) {
  if (!value) return undefined;
  if (!value.startsWith("/") || value.startsWith("//")) return undefined;
  if (value.startsWith("/api/")) return undefined;
  return value;
}

async function redirectToSignUp(request: Request) {
  const url = new URL(request.url);
  return redirect(await getSignUpUrl({
    redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI ?? `${url.origin}/callback`,
    returnTo: safeReturnTo(url.searchParams.get("returnTo")),
  }));
}

export const GET = redirectToSignUp;
export const POST = redirectToSignUp;
