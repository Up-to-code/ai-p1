"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { signInWithGoogle } from "../actions/sign-in-google";
import type { AuthRedirectOptions } from "../types/auth-redirect.types";

export function useGoogleSignIn({ callbackURL }: AuthRedirectOptions) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  async function signIn() {
    if (isPending) return;

    setIsPending(true);

    try {
      await signInWithGoogle({ callbackURL });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Google sign-in is not available yet.";

      toast({
        title: "Google sign-in failed",
        description:
          message.includes("provider") || message.includes("client")
            ? "Google sign-in is not enabled in Clerk. Enable the Google provider in Clerk, then try again."
            : message,
        type: "error",
      });
      setIsPending(false);
    }
  }

  return { signIn, isPending };
}
