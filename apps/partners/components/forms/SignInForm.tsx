"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signInSchema } from "@/lib/schemas/auth";
import { zodFormResolver } from "@/lib/schemas/resolver";

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  return fallback;
}

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const form = useForm({
    resolver: zodFormResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const valid = await form.trigger();
    if (!valid) return;

    setPending(true);
    setErrorMessage(null);
    const values = form.getValues();
    const response = await fetch("/api/partner-signin", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setPending(false);
      setErrorMessage(getErrorMessage(payload, "Could not sign in. Check the email and password."));
      return;
    }

    await fetch("/api/partner-organization", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Partner programmer organization", countryCode: "SA" }),
    }).catch(() => null);
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Field label="Password" error={form.formState.errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...form.register("password")} />
      </Field>
      {errorMessage ? <Alert variant="danger">{errorMessage}</Alert> : null}
      <Button type="submit" disabled={pending} size="lg" className="h-11 w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
