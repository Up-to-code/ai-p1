"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  PARTNER_COUNTRY_OPTIONS,
  validatePartnerSignupInput,
} from "@/lib/partner-signup";

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  return fallback;
}

function getErrorCode(payload: unknown) {
  return payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
    ? payload.error
    : null;
}

export default function PartnerProgrammerSignupForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [countryCode, setCountryCode] = useState("SA");
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountExists, setAccountExists] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setAccountExists(false);

    const parsed = validatePartnerSignupInput({
      name,
      email,
      password,
      confirmPassword,
      organizationName,
      countryCode,
    });
    if (!parsed.ok) {
      setErrorMessage(parsed.message);
      return;
    }

    setPending(true);

    const signupResponse = await fetch("/api/partner-signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: parsed.value.name,
        email: parsed.value.email,
        password: parsed.value.password,
        confirmPassword: parsed.value.password,
        organizationName: parsed.value.organizationName,
        countryCode: parsed.value.countryCode,
      }),
    });
    const signupPayload = await signupResponse.json().catch(() => ({}));
    if (!signupResponse.ok) {
      setPending(false);
      setAccountExists(getErrorCode(signupPayload) === "PARTNER_ACCOUNT_EXISTS");
      setErrorMessage(getErrorMessage(signupPayload, "Could not create the partner programmer account."));
      return;
    }

    const organizationResponse = await fetch("/api/partner-organization", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: parsed.value.organizationName,
        countryCode: parsed.value.countryCode,
      }),
    });
    const organizationPayload = await organizationResponse.json().catch(() => ({}));
    if (!organizationResponse.ok) {
      setPending(false);
      setErrorMessage(getErrorMessage(organizationPayload, "Account created, but the programmer organization could not be created."));
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} data-testid="partner-programmer-signup-form">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="partner-signup-name">
          <Input
            id="partner-signup-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Email" htmlFor="partner-signup-email">
          <Input
            id="partner-signup-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" htmlFor="partner-signup-password">
          <div className="relative">
            <Input
              id="partner-signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-[7px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
        <Field label="Confirm password" htmlFor="partner-signup-confirm-password">
          <div className="relative">
            <Input
              id="partner-signup-confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={12}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="pr-11"
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              onClick={() => setShowConfirmPassword((value) => !value)}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-[7px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>
      </div>

      <Field label="Programmer organization" htmlFor="partner-signup-organization-name">
        <Input
          id="partner-signup-organization-name"
          name="organizationName"
          autoComplete="organization"
          required
          value={organizationName}
          onChange={(event) => setOrganizationName(event.target.value)}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Country" htmlFor="partner-signup-country-code">
          <Select
            id="partner-signup-country-code"
            name="countryCode"
            value={countryCode}
            onChange={(event) => setCountryCode(event.target.value)}
          >
            {PARTNER_COUNTRY_OPTIONS.map((country) => (
              <option key={country.code} value={country.code}>
                {country.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {errorMessage ? (
        <Alert variant="danger">
          <p>{errorMessage}</p>
          {accountExists ? (
            <Link
              href={`/signin?returnTo=${encodeURIComponent(redirectTo)}`}
              className="mt-2 inline-flex text-sm font-semibold text-primary underline underline-offset-4"
            >
              Sign in to continue setup
            </Link>
          ) : null}
        </Alert>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full"
      >
        {pending ? "Creating account..." : "Create developer account"}
      </Button>
    </form>
  );
}
