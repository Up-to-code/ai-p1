"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  return fallback;
}

export default function EmailPasswordSignInForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrorMessage(null);

    const response = await fetch("/api/partner-signin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setPending(false);
      setErrorMessage(getErrorMessage(payload, "Could not sign in. Check the email and password."));
      return;
    }

    const organizationResponse = await fetch("/api/partner-organization", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Partner programmer organization",
        countryCode: "SA",
      }),
    });
    const organizationPayload = await organizationResponse.json().catch(() => ({}));
    if (!organizationResponse.ok) {
      setPending(false);
      setErrorMessage(getErrorMessage(organizationPayload, "Signed in, but the programmer organization could not be created."));
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5 text-sm font-medium text-foreground">
        <span>Email</span>
        <input
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
        />
      </label>
      <label className="block space-y-1.5 text-sm font-medium text-foreground">
        <span>Password</span>
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
        />
      </label>
      {errorMessage ? <p className="text-sm font-medium text-destructive">{errorMessage}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60 hover:bg-primary/90 transition-colors"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
