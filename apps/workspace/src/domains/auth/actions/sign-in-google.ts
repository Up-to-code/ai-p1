"use client";

import { authClient } from "@/lib/auth-client";
import type { AuthRedirectOptions } from "../types/auth-redirect.types";

export async function signInWithGoogle({ callbackURL }: AuthRedirectOptions) {
  await authClient.signIn.social({
    provider: "google",
    callbackURL,
  });
}
